export function authMiddleware(req: any, res: any, next: any) {
  console.log('Auth middleware - TODO: implement');
  next();
}

export default authMiddleware;