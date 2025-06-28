declare class faceIO {
  constructor(publicKey: string);

  enroll(options: {
    locale?: string;
    payload?: any;
  }): Promise<any>;

  authenticate(options: {
    locale?: string;
  }): Promise<any>;
}
