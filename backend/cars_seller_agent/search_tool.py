from crewai.tools import tool
import json
import re
from difflib import get_close_matches

@tool
def busca_veiculo(prompt: str) -> str:
    """
    Search and return vehicles that match the user's criteria.

    Logic:
    - If an exact or close (fuzzy) match is found for the requested model,
      return only that specific vehicle.
    - If no direct match is found, return up to two alternative suggestions 
      within the desired city and price range (if specified).

    Args:
        prompt (str): The user's input text describing their desired vehicle, 
                      location, and optional price.

    Returns:
        str: A JSON string with the matched vehicle(s), message, and status.
    """
    try:
        with open("data/cars.json", "r", encoding="utf-8") as f:
            veiculos = json.load(f)
    except Exception as e:
        return json.dumps({"erro": f"Error loading data: {e}"})

    preco_match = re.search(r"\d{4,6}", prompt.replace(".", "").replace(",", ""))
    preco_maximo = float(preco_match.group()) if preco_match else float("inf")

    texto = prompt.lower()
    palavras = texto.split()

    modelos = list({v["Model"].lower() for v in veiculos if "Model" in v})
    locais = list({v["Location"].lower() for v in veiculos if "Location" in v})

    modelo_desejado = next((m for m in modelos if m in texto), "")

    if not modelo_desejado:
        for palavra in palavras:
            parecido = get_close_matches(palavra, modelos, n=1, cutoff=0.8)
            if parecido:
                modelo_desejado = parecido[0]
                break

    local_desejado = next((l for l in locais if l in texto), "")

    def ordenar_por_preco(lista):
        return sorted(lista, key=lambda x: abs(x.get("Price", float("inf")) - preco_maximo))

    resultado_final = []
    msg_final = ""
    status_final = "NENHUM_VEICULO_ENCONTRADO"  

    if modelo_desejado and local_desejado:
        candidatos = [
            v for v in veiculos 
            if v.get("Model", "").lower() == modelo_desejado 
            and v.get("Location", "").lower() == local_desejado
            and v.get("Price", float('inf')) <= preco_maximo
        ]
        if candidatos:
            candidatos.sort(key=lambda x: x.get("Price"))
            veiculo_achado = candidatos[0]
            resultado_final.append(veiculo_achado)

            if veiculo_achado.get("Price") < preco_maximo:
                status_final = "MATCH_COMPLETO_PRECO_ABAIXO"
                msg_final = f"Great news! I found the {veiculo_achado['Model']} in {veiculo_achado['Location']} for R${veiculo_achado['Price']:.2f}, which is below your budget of R${preco_maximo:.2f}!"
            else:
                status_final = "MATCH_COMPLETO_PRECO_OK"
                msg_final = f"Perfect match! I found the {veiculo_achado['Model']} in {veiculo_achado['Location']} for exactly R${veiculo_achado['Price']:.2f}, matching your budget!"
            return json.dumps({"mensagem": msg_final, "status": status_final, "veiculos": resultado_final}, indent=2, ensure_ascii=False)

    if modelo_desejado and local_desejado:
        candidatos = [
            v for v in veiculos 
            if v.get("Model", "").lower() == modelo_desejado 
            and v.get("Location", "").lower() == local_desejado
        ]
        if candidatos:
            candidatos.sort(key=lambda x: x.get("Price"))
            veiculo_achado = candidatos[0]
            if veiculo_achado.get("Price") > preco_maximo:
                resultado_final.append(veiculo_achado)
                status_final = "MATCH_MODELO_LOCAL_PRECO_ACIMA"
                msg_final = f"I found the {veiculo_achado['Model']} in {veiculo_achado['Location']} for R${veiculo_achado['Price']:.2f}, but it is slightly above your budget of R${preco_maximo:.2f}."
                return json.dumps({"mensagem": msg_final, "status": status_final, "veiculos": resultado_final}, indent=2, ensure_ascii=False)

    if not resultado_final:
        if local_desejado:
            sugestoes_local = [
                v for v in veiculos
                if v.get("Location", "").lower() == local_desejado
                and v.get("Price", float('inf')) <= preco_maximo
                and (not modelo_desejado or v.get("Model", "").lower() != modelo_desejado)
            ]
            sugestoes_local = sorted(sugestoes_local, key=lambda x: abs(x.get("Price", float("inf")) - preco_maximo))
            for v_sug in sugestoes_local:
                if len(resultado_final) < 2:
                    resultado_final.append(v_sug)

        if modelo_desejado and len(resultado_final) < 2:
            sugestoes_modelo_outro_local = [
                v for v in veiculos
                if v.get("Model", "").lower() == modelo_desejado
                and v.get("Price", float('inf')) <= preco_maximo
                and (not local_desejado or v.get("Location", "").lower() != local_desejado)
            ]
            sugestoes_modelo_outro_local.sort(key=lambda x: x.get("Price"))
            for v_sug in sugestoes_modelo_outro_local:
                if len(resultado_final) < 2 and v_sug not in resultado_final:
                    resultado_final.append(v_sug)

        if resultado_final:
            status_final = "SUGESTOES_ALTERNATIVAS"
            msg_final = "I couldn’t find an exact match, but here are some suggestions based on your preferences:"
        else:
            msg_final = "Sorry, I couldn’t find any vehicles that meet your criteria."

    return json.dumps({"mensagem": msg_final, "status": status_final, "veiculos": resultado_final}, indent=2, ensure_ascii=False)
