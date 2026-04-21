numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
languages = ["Java", "Python", "SQL", "JavaScript"]
langs_sorted = sorted(languages, key=lambda x: len(x))
print(f"  按长度排序: {langs_sorted}")