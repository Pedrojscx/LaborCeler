// Acesso a tbcandidato, com SQL puro e sempre parametrizado (Princípio III). Recebe "consultar"
// para que os testes rodem dentro de uma transação desfeita no fim (research R16).

const CPF_DUPLICADO = 'CPF_DUPLICADO';

function criarRepositorioCandidato(consultar) {
  // O aceite dos termos é gravado com a hora do banco (FR-011).
  async function inserir({ cpf, nome, email, hashSenha }) {
    try {
      const { rows } = await consultar(
        `insert into tbcandidato (cpf, nome, email, senha, data_aceite_termos)
         values ($1, $2, $3, $4, now())
         returning id, nome, data_cadastro`,
        [cpf, nome, email, hashSenha],
      );
      return rows[0];
    } catch (erro) {
      // unique de cpf: também cobre dois cadastros simultâneos do mesmo CPF (FR-007).
      if (erro.code === '23505') {
        const duplicado = new Error('CPF já cadastrado');
        duplicado.code = CPF_DUPLICADO;
        throw duplicado;
      }
      throw erro;
    }
  }

  // Para o login: o hash só sai do repositório para a comparação no serviço.
  async function buscarPorCpf(cpf) {
    const { rows } = await consultar(
      'select id, nome, senha, data_cadastro from tbcandidato where cpf = $1',
      [cpf],
    );
    return rows[0] || null;
  }

  // Para a sessão: só o necessário (minimização, Princípio VI).
  async function buscarPorId(id) {
    const { rows } = await consultar(
      'select id, nome, data_cadastro from tbcandidato where id = $1',
      [id],
    );
    return rows[0] || null;
  }

  return { inserir, buscarPorCpf, buscarPorId };
}

module.exports = { criarRepositorioCandidato, CPF_DUPLICADO };
