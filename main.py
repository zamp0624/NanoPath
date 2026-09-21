import tkinter as tk
from ui import create_interface
window = tk.Tk()
window.title("NanoPath Simulator")
window.geometry("1000x700")
create_interface(window)
window.mainloop()