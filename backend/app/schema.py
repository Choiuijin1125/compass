from enum import Enum

class State(Enum):
    PROCESSING = 'PROCESSING'
    COMPLETED = 'COMPLETED'
    ERROR = 'ERROR'
