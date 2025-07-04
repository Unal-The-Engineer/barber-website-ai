from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://unalbuyukkoroglu@localhost:5432/barberdb")
engine = create_engine(DATABASE_URL, echo=True)
 
def get_session():
    with Session(engine) as session:
        yield session 