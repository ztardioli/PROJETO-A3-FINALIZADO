const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Adicione bcrypt para hash de senhas
const jwt = require('jsonwebtoken'); // Adicione JWT para autenticação
const saltRounds = 10; // Número de rounds para o bcrypt
const port = 8080;
const path = require('path');
const jwtSecret = 'sua_chave_secreta';


const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'backend_db'
});

db.connect((err) => {
	if (err) {
		console.error('Erro ao conectar ao banco de dados:', err);
		return;
	}
	console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

app.use(cors({
	origin: '*'
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));


// Middleware para verificar autenticação (JWT)
const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, jwtSecret, (err, user) => {
			if (err) {
				return res.sendStatus(403); // Token inválido
			}

			req.user = user;
			next();
		});
	} else {
		res.sendStatus(401); // Não autorizado (sem token)
	}
};

// Rotas para usuários

// 1. Criar usuário (registro)
app.post('/registro', async (req, res) => {
	const { name, email, password, phone_number } = req.body;

	try {
		// Hash da senha antes de salvar
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const sql = 'INSERT INTO Users (name, email, password, phone_number) VALUES (?, ?, ?, ?)';
		db.query(sql, [name, email, hashedPassword, phone_number], (err, result) => {
			if (err) {
				console.error('Erro ao criar usuário:', err);
				return res.status(500).send('Erro ao criar usuário');
			}

			// Gera um token JWT após o cadastro
			const token = jwt.sign({ id: result.insertId, email: email }, jwtSecret);
			res.status(201).json({ id: result.insertId, token: token });
		});
	} catch (error) {
		console.error('Erro ao realizar hash da senha:', error);
		res.status(500).send('Erro ao criar usuário');
	}
});

app.post('/login', (req, res) => {
	const { email, password } = req.body;

	const sql = 'SELECT * FROM users WHERE email = ?';
	db.query({
		sql: sql,
		values: email
	}, async (err, result) => {
		if (err) {
			console.error('Erro ao buscar usuário:', err);
			return res.status(500).send('Erro ao fazer login');
		}

		if (result.length === 0) {
			return res.status(401).send('Email ou senha incorretos');
		}

		const user = result[0];

		try {
			// Compara a senha fornecida com o hash armazenado no banco de dados
			if (await bcrypt.compare(password, user.password)) {
				// Gera um token JWT
				const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret);
				res.json({ id: user.id, token: token });
			} else {
				res.status(401).send('Email ou senha incorretos');
			}
		} catch (error) {
			console.error('Erro ao comparar hash da senha:', error);
			res.status(500).send('Erro ao fazer login');
		}
	});
});

// Rotas protegidas (requerem autenticação)

// 3. Buscar todos os serviços de um usuário
app.get('/services/user/:userId', authenticateJWT, (req, res) => {
	const userId = req.params.userId;

	const sql = 'SELECT * FROM Services WHERE user_id = ?';
	db.query(sql, [userId], (err, result) => {
		if (err) {
			console.error('Erro ao buscar serviços:', err);
			return res.status(500).send('Erro ao buscar serviços');
		}
		res.send(result);
	});
});

app.post('/services', authenticateJWT, (req, res) => {
	const { user_id, address, service } = req.body;

	if (!user_id || !address || !service) {
		return res.status(400).send('Campos obrigatórios não preenchidos');
	}

	// Verifica se o user_id existe na tabela Users
	const checkUserSql = 'SELECT * FROM Users WHERE id = ?';
	db.query(checkUserSql, [user_id], (err, result) => {
		if (err) {
			console.error('Erro ao verificar usuário:', err);
			return res.status(500).send('Erro ao verificar usuário');
		}

		if (result.length === 0) {
			return res.status(400).send('Usuário não encontrado');
		}

		const sql = 'INSERT INTO Services (user_id, address, service) VALUES (?, ?, ?)';
		db.query(sql, [user_id, address, service], (err, result) => {
			if (err) {
				console.error('Erro ao criar serviço:', err);
				return res.status(500).send('Erro ao criar serviço');
			}
			res.status(201).send('Serviço criado com sucesso');
		});
	});
});


app.put('/services/:id', authenticateJWT, (req, res) => {
	const id = req.params.id;
	const { address, service } = req.body; // Campos a serem atualizados
	const sql = 'UPDATE Services SET address = ?, service = ? WHERE id = ?';
	db.query(sql, [address, service, id], (err, result) => {
		if (err) {
			console.error('Erro ao deletar serviço:', err);
			return res.status(500).send('Erro ao atualizar serviço');
		}
		res.status(200).send('Serviço atualizado');
	});
});

app.delete('/services/:id', authenticateJWT, (req, res) => {
	const id = req.params.id;
	const sql = 'DELETE FROM Services WHERE id = ?';
	db.query(sql, [id], (err, result) => {
		if (err) {
			console.error('Erro ao deletar serviço:', err);
			return res.status(500).send('Erro ao deletar serviço');
		}
		res.status(200).send('Serviço deletado com sucesso');
	});
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "src", "HTML", "index.html")); // Caminho corrigido
});

app.get("/cadastrado", (req, res) => {
	res.sendFile(path.join(__dirname, "src", "HTML", "cadastrado.html")); // Caminho corrigido
});

app.get("/logado", (req, res) => {
	res.sendFile(path.join(__dirname, "src", "HTML", "logado.html")); // Caminho corrigido
});

app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
