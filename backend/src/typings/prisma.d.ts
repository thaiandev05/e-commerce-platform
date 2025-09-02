import { User } from "prisma/generated/prisma";

export interface UserWithoutPassword extends Omit<User, "hasingPassword"> {}
