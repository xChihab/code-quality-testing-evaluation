import type { Request, Response } from 'express';
import type { RunResult } from 'sqlite3';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import * as db from '../db/database';

interface User {
  id: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  created_at: string;
}

export const registerUser = (req: Request, res: Response) => {
  const { username, password, firstname, lastname } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 8);

  const database = db.getDb();

  database.run(
    `INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)`,
    [username, hashedPassword, firstname, lastname],
    function (this: RunResult, err: Error | null) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating user' });
      }

      const token = jwt.sign({ id: this.lastID }, 'your-super-secret-key-that-should-not-be-hardcoded', {
        expiresIn: 86400
      });

      res.status(201).json({ auth: true, token });
    }
  );
};

export const loginUser = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const database = db.getDb();

  database.get<User>(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error on the server.' });
    if (!user) return res.status(404).json({ error: 'No user found.' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, 'your-super-secret-key-that-should-not-be-hardcoded', { expiresIn: 86400 });

    res.status(200).json({
      auth: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  });
};

export const getAllUsers = (req: Request, res: Response) => {
  const database = db.getDb();

  database.all<Omit<User, 'password'>>(
    `SELECT id, username, firstname, lastname, created_at FROM users`,
    [],
    (err, users) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error getting users' });
      }
      res.json(users);
    }
  );
};

export const findSimilarUsernames = (req: Request, res: Response) => {
  const database = db.getDb();

  database.all<Pick<User, 'username'>>('SELECT username FROM users', [], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });

    const similar: { user1: string; user2: string; distance: number }[] = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const username1 = users[i].username.toLowerCase();
        const username2 = users[j].username.toLowerCase();

        const matrix: number[][] = [];
        for (let x = 0; x <= username1.length; x++) {
          matrix[x] = [x];
        }
        for (let y = 0; y <= username2.length; y++) {
          matrix[0][y] = y;
        }

        for (let x = 1; x <= username1.length; x++) {
          for (let y = 1; y <= username2.length; y++) {
            if (username1.charAt(x - 1) === username2.charAt(y - 1)) {
              matrix[x][y] = matrix[x - 1][y - 1];
            } else {
              matrix[x][y] = Math.min(matrix[x - 1][y - 1] + 1, matrix[x][y - 1] + 1, matrix[x - 1][y] + 1);
            }
          }
        }

        const distance = matrix[username1.length][username2.length];
        if (distance <= 2) {
          similar.push({ user1: users[i].username, user2: users[j].username, distance });
        }
      }
    }

    res.json({ similar, totalComparisons: (users.length * (users.length - 1)) / 2 });
  });
};
