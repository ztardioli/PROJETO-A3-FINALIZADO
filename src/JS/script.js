function salvarCadastro() {
	// Obtém os valores dos campos do formulário
	const nome = document.getElementById("nome").value;
	const email = document.getElementById("email").value;
	const senha = document.getElementById("senha").value;
	const error = document.querySelector(".error-signin");
	const telefone = document.getElementById("telefone").value;

	// Cria um objeto com os dados do cadastro
	const cadastro = {
		nome: nome,
		email: email,
		senha: senha,
		telefone: telefone,
	};

	// Converte o objeto para uma string JSON
	fetch("http://localhost:8080/registro", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name: nome,
			email: email,
			password: senha,
			phone_number: telefone
		})
	}).then(res => {
		if (res.status == 201) {
			alert("Cadastro salvo com sucesso!");
			window.location.href = "http://localhost:8080/cadastrado";
		} else {
			error.innerHTML = "Usuário já existe!";
		}
	})

}


async function login() {
	const email = document.querySelector("#email_login").value;
	const senha = document.querySelector("#senha_login").value;

	fetch("http://localhost:8080/login", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: email,
			password: senha,
		})
	}).then(res => {
		if (res.status == 200) {
			alert("Logado com sucesso!");
			res.json().then(data => {
				localStorage.setItem("userId", data.id);
				localStorage.setItem("token", data.token);
			}).finally(() => window.location.href = "http://localhost:8080/logado");
		} else {
			alert("Usuário incorreto.")
		}
	})


}

async function listUsers() {
	const userId = localStorage.getItem("userId");
	const token = localStorage.getItem("token");

	if (!userId || !token) {
		alert("User ID ou token não encontrado no localStorage");
		return;
	}

	try {
		const response = await fetch(`http://localhost:8080/services/user/${userId}`, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});

		if (response.ok) {
			const services = await response.json();
			const userTableBody = document.querySelector("#userTable tbody");

			// Limpa qualquer dado existente no tbody
			userTableBody.innerHTML = "";

			// Adiciona cada serviço na tabela
			services.forEach(service => {
				const row = document.createElement("tr");
				row.innerHTML = `
					<td>${service.user_id}</td>
					<td>${service.address}</td>
					<td>${service.service}</td>
					<td>
						<button onclick="editService(${service.id}, '${service.address}', '${service.service}')">Editar</button>
						<button onclick="deleteService(${service.id})">Excluir</button>
					</td>
				`;
				userTableBody.appendChild(row);
			});
		} else {
			alert("Erro ao buscar os dados do usuário");
		}
	} catch (error) {
		console.error("Erro:", error);
		alert("Erro ao se conectar com o servidor");
	}
}

async function deleteService(serviceId) {
	const token = localStorage.getItem("token");

	if (!token) {
		alert("Token não encontrado no localStorage");
		return;
	}

	await fetch(`http://localhost:8080/services/${serviceId}`, {
		method: "DELETE",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	}).then((res) => {
		if (res.ok) {
			alert("Serviço excluído com sucesso!");
			location.reload();
		} else {
			alert("Erro ao excluir serviço");
		}
	});

}

function editService(id, address, service) {
	document.getElementById("editServiceId").value = id;
	document.getElementById("editAddress").value = address;
	document.getElementById("editService").value = service;
	document.getElementById("editForm").style.display = "block";
}

async function saveService() {
	const id = document.getElementById("editServiceId").value;
	const address = document.getElementById("editAddress").value;
	const service = document.getElementById("editService").value;
	const token = localStorage.getItem("token");

	if (!token) {
		alert("Token não encontrado no localStorage");
		return;
	}
	await fetch(`http://localhost:8080/services/${id}`, {
		method: "PUT",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({
			address: address,
			service: service
		})
	}).then(res => {
		if (res.ok) {
			alert("Serviço atualizado com sucesso!");
			document.getElementById("editForm").style.display = "none";
			listUsers(); // Atualiza a lista de serviços após editar um
		} else {
			alert("Erro ao atualizar serviço");
		}
	});



}
