from datetime import date


def formatar_data(d: date | None) -> str | None:
    if not d:
        return None
    return d.strftime("%d/%m/%Y")


def dias_para_texto(dias: int) -> str:
    anos = dias // 360
    resto = dias % 360
    meses = resto // 30
    d = resto % 30
    partes = []
    if anos:
        partes.append(f"{anos}A")
    if meses:
        partes.append(f"{meses}M")
    if d:
        partes.append(f"{d}D")
    return " ".join(partes) if partes else "0D"
