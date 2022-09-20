try:
    import os
except ImportError:
    import uos as os


def mkdir(path):
    fragments = path.split('/')
    _working_path = ''

    for index, fragment in enumerate(fragments):
        sep = '/' if index else ''
        _working_path += sep + fragment
        if(_working_path):
            try:
                os.mkdir(_working_path)
            except OSError as exc:
                if exc.args[0] == errno.EEXIST:
                    pass
                else:
                    raise
