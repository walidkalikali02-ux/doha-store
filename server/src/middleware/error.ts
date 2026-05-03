export function errorHandler(err: Error, req: any, res: any, next: any) {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
}

export default errorHandler;