
try:
    import os
except ImportError:
    import uos as os


def listdir(directory):
    return os.listdir(directory)
