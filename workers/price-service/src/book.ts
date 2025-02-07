import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
interface Env {
  DATABASE_URL: string;
}
export interface Book {
  id: number;
  title: string;
  author: string;
}

const bookRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    // const db = drizzle(c.env.DATABASE_URL);
    // const result = await db.select().from(book);
    return c.json({ message: "Hello, World!Book" });
  })
  .get("/:id", async (c) => {
    // const db = drizzle(c.env.DATABASE_URL);
    const { id } = c.req.param();
    // const [result] = await db.select().from(book).where(eq(book.id, id));
    if (!id) {
      return c.json({ message: "Book not found" }, 404);
    }
    return c.json({ message: `Hello, World!Book ${id}` });
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        title: z
          .string({
            required_error: "Title is required",
          })
          .nonempty(),
        author: z
          .string({
            required_error: "Author is required",
            invalid_type_error: "Author must be a string",
          })
          .nonempty(),
      })
    ),
    async (c) => {
      const { title, author } = await c.req.json();
    //   const db = drizzle(c.env.DATABASE_URL);
    //   const result = await db.insert(book).values({ title, author });
      return c.json({ message: `Hello, World!Book ${title} ${author}` }, 201);
    }
  )

export default bookRoute;