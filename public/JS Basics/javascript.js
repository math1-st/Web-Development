// Foi realizada uma pesquisa entre os habitantes de uma dada região. 
// Foram recolhidos os dados de idade, sexo (M/F) e salário. 
// Construa um programa em JavaScript que informe:
// a média de salário do grupo; 
// maior e menor idade do grupo; 
// quantidade de mulheres com salário até R$5000,00. 
// Encerre a entrada de dados quando for digitada uma idade negativa.

let lista_idade = []
qnt_habitantes = parseInt(prompt("Quantos habitantes: "))
qnt_mulheres_salario_5k = 0
salario = 0

for (let i= 0; i < qnt_habitantes; i++) {

    genero = prompt("[H]omem ou [M]ulher: ")
    salario_p = parseInt(prompt("Qual o seu salário: "))
    salario += salario_p

    if (genero == "m") {
        if (salario_p <= 5000) {
        qnt_mulheres_salario_5k++
    }}

    idade = parseInt(prompt("Qual a sua idade: "))
    if (idade < 0) {
        window.alert(`Error! No age is below 0.`)
        continue
    }

    lista_idade.push(idade)
}
lista_idade.sort((a, b) => a - b)
let menor_idade = lista_idade[0]
let maior_idade = lista_idade[lista_idade.length - 1]
media_salarial = salario / qnt_habitantes

window.alert(`Menor idade da região: ${menor_idade}`)
window.alert(`Maior idade da região: ${maior_idade}`)
window.alert(`Media salarial: ${media_salarial}`)
window.alert(`Quantidade de mulheres com salário abaixo ou igual a 5k: ${qnt_mulheres_salario_5k}`)