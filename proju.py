import json
import os

KANSIO = os.path.dirname(os.path.abspath(__file__))

# TIEDOSTO FUNKTIOT
def polku(tiedostonimi):
    return os.path.join(KANSIO, tiedostonimi)

# TIEDOSTOJEN LUKU
def lue_tiedosto(tiedostonimi):
    try:
        with open(polku(tiedostonimi), "r", encoding="utf-8") as tiedosto:
            print(tiedosto.read())
    except FileNotFoundError:
        print(f"tiedostoa {tiedostonimi} ei löytynyt")

# PELAAJA 
class Pelaaja:
    def __init__(self, nimi, ika):
        self.nimi = nimi
        self.ika = ika
        self.inventaario = []
        self.elossa = True  
# TAVARAT & KILL
    def lisaa_tavara(self, tavara):
        self.inventaario.append(tavara)
        print(f"Lisättiin inventaarioon: {tavara}")
    def tapa(self, syy):
        self.elossa = False
        print(f"\n{self.nimi} kuoli: {syy}")

    def nayta_tila(self):
        print(f"\nNimi: {self.nimi}")
        print(f"elossa: {self.elossa}")
        print("inventaario: ", self.inventaario)    
# TALLENNUS
def tallenna_peli(pelaaja):
    tiedot = {
        "nimi": pelaaja.nimi,
        "ika": pelaaja.ika,
        "inventaario": pelaaja.inventaario,
        "elossa": pelaaja.elossa,
    }
    with open(polku(f"tallennus_{pelaaja.nimi}.json"), "w", encoding="utf-8") as tiedosto:
        json.dump(tiedot, tiedosto, ensure_ascii=False, indent=4)
    print("Peli tallennettu.")

def lataa_peli(nimi):
    tiedostonimi = polku(f"tallennus_{nimi}.json")
    if not os.path.exists(tiedostonimi):
        return None
    with open(tiedostonimi, "r", encoding="utf-8") as tiedosto:
        tiedot = json.load(tiedosto)
    pelaaja = Pelaaja(tiedot["nimi"], tiedot["ika"])
    pelaaja.inventaario = tiedot["inventaario"]
    pelaaja.elossa = tiedot["elossa"]
    return pelaaja
# TULOSTUS FUNKTIOT   
def valikko():
    print("-päävalikko-")
    print("aloita peli painamalla 1")
    print("inventaario painamalla 2")
    print("credits painamalla 3")
    print("ohjeet painamalla 4")
    print("lopeta peli kirjoittamalla lopeta")
    print("")
def NAYTA_inventaario(tavarat):
    print("tavarasi:")
    if not tavarat:
         print("(tyhjä)")
    for item in tavarat:
        print(item) 
def credits():
    print("Credits")
    print("Pelin tekijä: Ella Wikman, Nici Makkonen, Sitana Silma")
    print("Pelin suunnittelija: Ella Wikman, Nici Makkonen, Sitana Silma")
    print("Pelin ohjelmoija: Ella Wikman(Pelin pohja), Nici Makkonen, Sitana Silma")
    print("tehty: 2026")

# PELIN KÄYNNISTYS

lue_tiedosto("intro.txt")
lue_tiedosto("ohjeet.txt")

nimi = input("Anna nimesi: ")
pelaaja = lataa_peli(nimi)

if pelaaja:
    print(f"Tervetuloa takaisin, {pelaaja.nimi}!")
    pelaaja.nayta_tila()
else:
    while True:
        try:
            ika = int(input("Anna ikäsi: "))
            break
        except ValueError:
            print("anna ikä numeroina.")
    pelaaja = Pelaaja(nimi, ika)
    print(f"Hei {nimi}")
    print(f"Olet {ika} vuotta vanha :)")

input("Paina enter aloittaaksesi pelin: ")    

#päävalikko toistuu kunnes pelaaja kirjoittaa lopeta

while True:
    print("")
    valikko()
    valinta = input("Valitse toiminto: ")
    if valinta == "1":
        input("Paina aina enter päästäkseesi eteenpäin: ")
        pelaa(pelaaja)
    elif valinta == "2":
        print("Avasit inventaarion")
        NAYTA_inventaario(pelaaja.inventaario)
    elif valinta == "3":
        print("Avasit Credits")
        credits()
    elif valinta == "4":
        lue_tiedosto("ohjeet.txt")
    elif valinta == "lopeta":
        print("Lopetit pelin")
        break
    else:
        print("tuntematon valinta")