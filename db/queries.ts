import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation, recipe } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);

console.info(
  "DB CLIENT ",
  client,
  " POSTGRES_URL from env ",
  process.env.POSTGRES_URL,
);
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}

export async function saveRecipe({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  try {
    // Check if recipe with this ID already exists
    const existingRecipe = await db
      .select({ count: sql`count(*)` })
      .from(recipe)
      .where(eq(recipe.id, id));
      
    const count = parseInt(existingRecipe[0]?.count as string || "0");
    
    if (count > 0) {
      console.log(`Recipe with ID ${id} already exists, using update instead of insert`);
      return await db
        .update(recipe)
        .set({
          details: JSON.stringify(details),
        })
        .where(eq(recipe.id, id));
    }
    
    // If no existing recipe, insert a new one
    return await db.insert(recipe).values({
      id,
      createdAt: new Date(),
      userId,
      details: JSON.stringify(details),
      isFavorite: false,
    });
  } catch (error) {
    console.error("Failed to save recipe:", error);
    // Return null instead of throwing to prevent the application from crashing
    return null;
  }
}

export async function getRecipeById({ id }: { id: string }) {
  const [selectedRecipe] = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, id));

  return selectedRecipe;
}

export async function getRecipesByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(recipe)
      .where(eq(recipe.userId, id))
      .orderBy(desc(recipe.createdAt));
  } catch (error) {
    console.error("Failed to get recipes by user from database");
    throw error;
  }
}

export async function toggleFavoriteRecipe({
  id,
  isFavorite,
}: {
  id: string;
  isFavorite: boolean;
}) {
  return await db
    .update(recipe)
    .set({
      isFavorite,
    })
    .where(eq(recipe.id, id));
}
