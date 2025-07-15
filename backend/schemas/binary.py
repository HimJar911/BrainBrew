from pydantic import BaseModel, conint, field_validator
from typing import Literal, Annotated

class BinaryStartRequest(BaseModel):
    difficulty: Literal["easy", "normal", "hard"]

class BinaryStartResponse(BaseModel):
    game_id: int
    range_min: int
    range_max: int
    first_turn: Literal["user"]

class BinaryGuessRequest(BaseModel):
    game_id: Annotated[int, conint(gt=0)]
    guess: Annotated[int, conint(ge=1, le=1000)]  # validated against hard mode

    @field_validator("guess")
    def validate_guess(cls, v):
        if not isinstance(v, int):
            raise ValueError("Guess must be an integer.")
        return v
