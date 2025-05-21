import { Request, Response } from "express";
import { User, CreateUserDto, UpdateUserDto } from "../types/user";

let users: User[] = [];
let nextId = 1;

export const getAllUsers = (_req: Request, res: Response): void => {
  res.json(users);
};

export const getUserById = (req: Request, res: Response): void => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};

export const createUser = (
  req: Request<{}, {}, CreateUserDto>,
  res: Response,
): void => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required" });
    return;
  }

  const newUser: User = {
    id: nextId++,
    name,
    email,
    createdAt: new Date(),
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

export const updateUser = (
  req: Request<{ id: string }, {}, UpdateUserDto>,
  res: Response,
): void => {
  const { name, email } = req.body;
  const userId = parseInt(req.params.id);

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const updatedUser: User = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    updatedAt: new Date(),
  };

  users[userIndex] = updatedUser;
  res.json(updatedUser);
};

export const deleteUser = (req: Request, res: Response): void => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  users = users.filter((u) => u.id !== userId);
  res.status(204).send();
};
