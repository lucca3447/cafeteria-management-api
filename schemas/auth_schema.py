from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    login: str = Field(min_length=3, max_length=50)
    senha: str = Field(min_length=8, max_length=100)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LogoutResponse(BaseModel):
    mensagem: str
