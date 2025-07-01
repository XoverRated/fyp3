import { supabase } from "@/integrations/supabase/client";

export interface FaceSignatureData {
  faceioFaceId: string;
  userInfo: any;
  rawSignature?: string;
}

export interface StoredFaceSignature {
  id: string;
  user_id: string;
  faceio_face_id: string | null;
  signature_hash: string;
  registration_timestamp: string | null;
  last_used: string | null;
  is_active: boolean | null;
  metadata: any;
}

/**
 * Hash face signature data for secure storage using Web Crypto API
 */
async function hashSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Store face signature data in the database after FaceIO registration
 */
export async function storeFaceSignature(faceSignatureData: FaceSignatureData): Promise<void> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Create signature hash from FaceIO data
    const signatureString = JSON.stringify({
      faceioId: faceSignatureData.faceioFaceId,
      details: faceSignatureData.userInfo.details,
      timestamp: new Date().toISOString()
    });
    
    const signatureHash = await hashSignature(signatureString);

    // Store face signature in database
    const { data: faceSignature, error: insertError } = await supabase
      .from('face_signatures')
      .insert({
        user_id: user.id,
        faceio_face_id: faceSignatureData.faceioFaceId,
        signature_hash: signatureHash,
        metadata: {
          userInfo: faceSignatureData.userInfo,
          deviceInfo: navigator.userAgent,
          registrationIp: await getClientIP()
        }
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to store face signature: ${insertError.message}`);
    }

    // Update user profile to mark face as registered
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        face_registered: true,
        face_signature_id: faceSignature.id
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log('✅ Face signature stored successfully');
  } catch (error) {
    console.error('❌ Error storing face signature:', error);
    throw error;
  }
}

/**
 * Verify face signature exists for the current user
 */
export async function verifyFaceSignature(faceioFaceId: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if face signature exists and is active
    const { data: faceSignature, error: selectError } = await supabase
      .from('face_signatures')
      .select('*')
      .eq('user_id', user.id)
      .eq('faceio_face_id', faceioFaceId)
      .eq('is_active', true)
      .single();

    if (selectError) {
      console.error('Face signature verification failed:', selectError.message);
      return false;
    }

    if (faceSignature) {
      // Update last used timestamp
      await supabase
        .from('face_signatures')
        .update({ last_used: new Date().toISOString() })
        .eq('id', faceSignature.id);

      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error verifying face signature:', error);
    return false;
  }
}

/**
 * Get user's face registration status
 */
export async function getFaceRegistrationStatus(): Promise<{
  isRegistered: boolean;
  faceSignature?: StoredFaceSignature;
}> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { isRegistered: false };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('face_registered, face_signature_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { isRegistered: false };
    }

    if (!profile.face_registered || !profile.face_signature_id) {
      return { isRegistered: false };
    }

    // Get face signature details
    const { data: faceSignature, error: signatureError } = await supabase
      .from('face_signatures')
      .select('*')
      .eq('id', profile.face_signature_id)
      .single();

    if (signatureError) {
      return { isRegistered: false };
    }

    return {
      isRegistered: true,
      faceSignature: faceSignature
    };
  } catch (error) {
    console.error('❌ Error getting face registration status:', error);
    return { isRegistered: false };
  }
}

/**
 * Deactivate face signature (useful for security purposes)
 */
export async function deactivateFaceSignature(): Promise<void> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Deactivate all face signatures for user
    const { error: updateError } = await supabase
      .from('face_signatures')
      .update({ is_active: false })
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error(`Failed to deactivate face signature: ${updateError.message}`);
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        face_registered: false,
        face_signature_id: null
      })
      .eq('id', user.id);

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log('✅ Face signature deactivated successfully');
  } catch (error) {
    console.error('❌ Error deactivating face signature:', error);
    throw error;
  }
}

/**
 * Get client IP address (for logging purposes)
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}