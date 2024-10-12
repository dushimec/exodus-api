// src/types/express.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface User {
      userId: string;
      isAdmin: boolean;
    }
  }
}
