import { Hono } from "hono";
import { Bindings } from "hono/types";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import {createPostInput,updatePostInput } from '@atharv1608/common-app'


export const blogRouter = new Hono<{ 
    Bindings: {
    DATABASE_URL : string
    JWT_SECRET : string
  } ,
    Variables : {
      userId : string
    }
  }>()

blogRouter.use('/*',async(c,next)=>{
    const authHeader = c.req.header("authorization") || "";
    const user = await verify(authHeader,c.env.JWT_SECRET);
    if(user){
        c.set("userId",user.id)
        await next()
    }
    else{
        return c.json({
            msg : "you are not signed up"
        })
    }
    
})

blogRouter.post('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const {success} = createPostInput.safeParse(body);
	if(!success){
		c.status(411)
		return c.json({
			message : "inputs are incorrect"
		})
	}
	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({
		id: post.id
	});
})

  
blogRouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const {success} = updatePostInput.safeParse(body);
	if(!success){
		c.status(411)
		return c.json({
			message : "inputs are incorrect"
		})
	}
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});

blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const posts = await prisma.post.findMany({
		select : {
			content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
		}
	});

	return c.json({
		posts 
	});
})
  
blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.post.findFirst({
            where: {
				
                id: id
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
    
        return c.json({
            blog
        });
    } catch(e) {
        c.status(411); // 4
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})

