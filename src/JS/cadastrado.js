// Função para carregar e exibir os dados do cadastro
function exibirDadosCadastro() {
  // Obtém os dados do local storage
  const cadastroJSON = localStorage.getItem("cadastro");

  if (cadastroJSON) {
    // Converte a string JSON de volta para um objeto
    const cadastro = JSON.parse(cadastroJSON);
  }
}

window.onload = function () {
  // Recupera e define a seleção do rádio do localStorage
  const materialSelecionado = localStorage.getItem("material");
  if (materialSelecionado) {
    const radios = document.getElementsByName("material");
    for (const radio of radios) {
      if (radio.value === materialSelecionado) {
        radio.checked = true;
        break;
      }
    }
  }

  // Recupera e define o valor do campo de texto infoExtra do localStorage
  const infoExtra = localStorage.getItem("infoExtra");
  if (infoExtra) {
    document.getElementById("infoExtra").value = infoExtra;
  }

  // Recupera e define o valor do campo de texto endereço do localStorage
  const endereco = localStorage.getItem("endereco");
  if (endereco) {
    document.getElementById("endereco").value = endereco;
  }
};

async function obterMaterialSelecionado() {
  const radios = document.getElementsByName("material");
  let materialSelecionado = null;

  for (const radio of radios) {
    if (radio.checked) {
      materialSelecionado = radio.value;
      break;
    }
  }

  const infoExtra = document.getElementById("infoExtra").value;
  const endereco = document.getElementById("endereco").value;
  const resultado = document.getElementById("resultado");
  const userId = localStorage.getItem("userId");

  if (!userId) {
    resultado.textContent = "User ID não encontrado no localStorage.";
    return;
  }

  if (materialSelecionado && endereco) {
    try {
      const response = await fetch("http://localhost:8080/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: userId,
          address: endereco,
          service: materialSelecionado + (infoExtra ? ` - ${infoExtra}` : ""),
        }),
      });

      if (response.ok) {
        resultado.textContent = "Serviço criado com sucesso!";
      } else {
        resultado.textContent = "Erro ao criar serviço.";
      }
    } catch (error) {
      console.error("Erro:", error);
      resultado.textContent = "Erro ao se conectar com o servidor.";
    }
  } else {
    resultado.textContent = "Material e Endereço são obrigatórios.";
  }
}
// Chama a função ao carregar a página
window.onload = exibirDadosCadastro;
