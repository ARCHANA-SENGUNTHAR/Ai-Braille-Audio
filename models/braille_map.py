# Simple English to Braille mapping
braille_dict = {
    "a":"⠁","b":"⠃","c":"⠉","d":"⠙","e":"⠑","f":"⠋","g":"⠛","h":"⠓",
    "i":"⠊","j":"⠚","k":"⠅","l":"⠇","m":"⠍","n":"⠝","o":"⠕","p":"⠏",
    "q":"⠟","r":"⠗","s":"⠎","t":"⠞","u":"⠥","v":"⠧","w":"⠺","x":"⠭",
    "y":"⠽","z":"⠵"," ":" ","0":"⠴","1":"⠂","2":"⠆","3":"⠒","4":"⠲",
    "5":"⠢","6":"⠖","7":"⠶","8":"⠦","9":"⠔",".":"⠲",",":"⠂","?":"⠦",
    "!":"⠖","-":"⠤"
}

def text_to_braille(text):
    result = ""
    for char in text.lower():
        result += braille_dict.get(char, "")
    return result
