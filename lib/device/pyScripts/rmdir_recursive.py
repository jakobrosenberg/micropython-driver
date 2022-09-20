try:
    import os
except ImportError:
    import uos as os


def rmdir(dir, preserve_root=False):
    for i in os.ilistdir(dir):
        sep = '' if dir == '/' else '/'
        path = dir+sep+i[0]
        try:
            if i[1] == 16384:
                rmdir(path)
            elif i[1] == 32768:
                os.remove(path)
        except:
            print('failed to delete '+path)
            raise

    if not (preserve_root):
        os.rmdir(dir)
