try:
    import os
except ImportError:
    import uos as os


def mkdir(path):
    os.mkdir(path)
