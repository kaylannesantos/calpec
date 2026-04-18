"""
Módulo de cálculos conforme a Lei de Execução Penal (LEP — Lei nº 7.210/1984)
e alterações do Pacote Anticrime (Lei nº 13.964/2019).
"""

from datetime import date, timedelta
from enum import Enum


class NaturezaCrime(str, Enum):
    comum = "comum"
    hediondo = "hediondo"
    hediondo_morte = "hediondo_morte"
    feminicidio = "feminicidio"
    milicia = "milicia"
    org_criminosa = "org_criminosa"


# Percentuais de progressão — art. 112 LEP
PERCENTUAIS_PROGRESSAO = {
    # (natureza, reincidente): percentual
    ("comum", False): 0.16,
    ("comum", True): 0.20,
    ("violento", False): 0.25,
    ("violento", True): 0.30,
    ("hediondo", False): 0.40,
    ("hediondo_morte", False): 0.50,
    ("feminicidio", False): 0.55,
    ("hediondo", True): 0.60,
    ("hediondo_morte", True): 0.70,
    ("milicia", False): 0.50,
    ("org_criminosa", False): 0.50,
}


def pena_para_dias(anos: int, meses: int, dias: int) -> int:
    """Converte pena em anos/meses/dias para total em dias (1 mês = 30 dias)."""
    return (anos * 360) + (meses * 30) + dias


def dias_para_extenso(total_dias: int) -> dict:
    """Converte dias para anos, meses e dias."""
    anos = total_dias // 360
    resto = total_dias % 360
    meses = resto // 30
    dias = resto % 30
    return {"anos": anos, "meses": meses, "dias": dias}


def calcular_detracao(inicio: date, fim: date) -> int:
    """Calcula dias de detração (prisão provisória)."""
    if not inicio or not fim:
        return 0
    delta = (fim - inicio).days
    return max(0, delta)


def calcular_remicao(dias_trabalhados: int, horas_estudo: int, obras_lidas: int) -> int:
    """
    Calcula total de dias remidos — art. 126 LEP:
    - Trabalho: 1 dia remido a cada 3 dias trabalhados
    - Estudo: 1 dia remido a cada 12h de frequência escolar
    - Leitura: 4 dias remidos por obra lida (máx. 12 obras/ano)
    """
    remicao_trabalho = dias_trabalhados // 3
    remicao_estudo = horas_estudo // 12
    remicao_leitura = obras_lidas * 4
    return remicao_trabalho + remicao_estudo + remicao_leitura


def calcular_percentual_progressao(natureza: str, reincidente: bool) -> float:
    """Retorna o percentual necessário para progressão de regime — art. 112 LEP."""
    chave = (natureza, reincidente)
    return PERCENTUAIS_PROGRESSAO.get(chave, 0.16)


def determinar_regime_inicial(pena_dias: int, reincidente: bool) -> str:
    """
    Determina o regime inicial conforme art. 33 do Código Penal:
    - > 8 anos: fechado
    - > 4 anos e <= 8 anos (primário): semiaberto
    - <= 4 anos (primário): aberto
    - Reincidente: sempre fechado se > 4 anos
    """
    pena_anos = pena_dias / 360
    if pena_anos > 8:
        return "Fechado"
    if reincidente:
        return "Fechado" if pena_anos > 4 else "Semiaberto"
    if pena_anos > 4:
        return "Semiaberto"
    return "Aberto"


def determinar_regime_progressao(regime_atual: str) -> str:
    """Retorna o próximo regime na progressão."""
    progressao = {
        "Fechado": "Semiaberto",
        "Semiaberto": "Aberto",
        "Aberto": "Liberdade Condicional",
    }
    return progressao.get(regime_atual, "Liberdade Condicional")


def calcular_execucao(
    pena_anos: int,
    pena_meses: int,
    pena_dias: int,
    natureza_crime: str,
    reincidente: bool,
    data_inicio: date,
    detracao_inicio: date | None,
    detracao_fim: date | None,
    dias_trabalhados: int,
    horas_estudo: int,
    obras_lidas: int,
) -> dict:
    """
    Cálculo completo da execução penal conforme LEP.
    Retorna dicionário com todos os resultados.
    """
    # 1. Converter pena para dias
    pena_total_dias = pena_para_dias(pena_anos, pena_meses, pena_dias)

    # 2. Aplicar detração
    dias_detracao = calcular_detracao(detracao_inicio, detracao_fim)
    pena_base_dias = pena_total_dias - dias_detracao

    # 3. Calcular remição
    dias_remidos = calcular_remicao(dias_trabalhados, horas_estudo, obras_lidas)
    pena_efetiva_dias = pena_base_dias - dias_remidos

    # 4. Regime inicial
    regime_inicial = determinar_regime_inicial(pena_base_dias, reincidente)

    # 5. Percentual e lapso para progressão
    percentual = calcular_percentual_progressao(natureza_crime, reincidente)
    dias_para_progressao = int(pena_base_dias * percentual)
    data_progressao = data_inicio + timedelta(days=dias_para_progressao)
    regime_progressao = determinar_regime_progressao(regime_inicial)

    # 6. Data de término
    data_termino = data_inicio + timedelta(days=pena_efetiva_dias)

    return {
        "pena_total_dias": pena_total_dias,
        "dias_detracao": dias_detracao,
        "pena_base_dias": pena_base_dias,
        "dias_remidos": dias_remidos,
        "pena_efetiva_dias": pena_efetiva_dias,
        "regime_inicial": regime_inicial,
        "percentual_progressao": percentual,
        "dias_para_progressao": dias_para_progressao,
        "data_progressao": data_progressao,
        "regime_progressao": regime_progressao,
        "data_termino": data_termino,
        "pena_extenso": dias_para_extenso(pena_efetiva_dias),
        "progressao_extenso": dias_para_extenso(dias_para_progressao),
    }
