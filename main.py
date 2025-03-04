import random
list_figures = ["Шар", "Параллелепипед", "Тетраэдр"]
for x in range(10):
    ran_figure = random.choice(list_figures)
    ran_plotnost = random.uniform(0,1000)
    if ran_figure == "Шар":
        ran_radius = random.randrange(0, 1000)
        print(ran_figure, ran_radius, ran_plotnost)
    if ran_figure == "Параллелепипед":
        storona1 = random.randrange(0, 1000)
        storona2 = random.randrange(0, 1000)
        storona3 = random.randrange(0, 1000)
        print(ran_figure, storona1, storona2, storona3, ran_plotnost)
    if ran_figure == "Тетраэдр":
        rebro = random.randrange(0, 1000)
        print(ran_figure, rebro, ran_plotnost)

