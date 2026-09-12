import crypto from 'crypto';

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
export const generateOtp = (): string=>{
  const otp = crypto.randomInt(100000,1000000);
  return otp.toString()
}
export const hashOtp = (otp:string): string=>{
  return crypto.createHash('sha256').update(otp).digest('hex');
};
export const compareOtpHash = (incoming:string, stored):boolean =>{
  const incomingHash = hashOtp(incoming);
  const a = Buffer.from(incoming,'hex')
  const b = Buffer.from(stored, 'hex')
  if(a.length !== b.length) return false;
  return crypto.timingSafeEqual(a,b)
}

export default { generateVerificationToken, generateRandomString, generateOtp,hashOtp,compareOtpHash };