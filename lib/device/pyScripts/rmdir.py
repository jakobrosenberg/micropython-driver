try:
    import os
except ImportError:
    import uos as os


def rmdir(dir):
    os.rmdir(dir)
