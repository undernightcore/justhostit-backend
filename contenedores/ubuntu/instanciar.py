import sys
import os

token = sys.argv[1]
contraseña = sys.argv[2]
version = sys.argv[3]

os.system('lxc launch ubuntu:' + version + ' instancia-' + token + '&')