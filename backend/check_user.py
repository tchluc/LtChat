import asyncio
from app.db.session import async_session
from app.models.user import User
from app.core.security import get_password_hash
from sqlmodel import select

async def main():
    async with async_session() as db:
        print("Checking for user 'leo'...")
        result = await db.exec(select(User).where(User.username == "leo"))
        user = result.first()
        
        if user:
            print(f"User 'leo' found. ID: {user.id}")
            # Optional: Reset password to be sure
            # user.hashed_password = get_password_hash("123456")
            # db.add(user)
            # await db.commit()
            # print("Password reset to '123456'")
        else:
            print("User 'leo' not found. Creating...")
            hashed = get_password_hash("123456")
            user = User(username="leo", email="leo@example.com", hashed_password=hashed)
            db.add(user)
            await db.commit()
            print("User 'leo' created with password '123456'")

if __name__ == "__main__":
    asyncio.run(main())
