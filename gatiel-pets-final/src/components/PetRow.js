// Card visual reutilizável que exibe as 
// informações de um pet individual (foto, nome, espécie, idade, sexo, status) com botões de editar e excluir

// Componente funcional que representa o CARD visual de um único pet
// Recebe 3 props: o objeto 'pet' com os dados, e dois callbacks de ação
function PetRow({ pet, onEditar, onExcluir }) {
  return (

    // Coluna responsiva do Bootstrap: 4 colunas em telas médias, 6 em telas pequenas, com margem inferior
    <div className="col-md-4 col-sm-6 mb-4">

      {/* Card com altura total, sombra suave, sem borda e com posicionamento relativo (para o badge absoluto) */}
      <div className="card h-100 shadow-sm border-0 position-relative">

        {/* ── Badge de status posicionado no canto superior direito do card ── */}
        <span className={`badge position-absolute top-0 end-0 m-3 fs-6 ${
          pet.status === 'Disponível' ? 'bg-success'       : // Verde = disponível para adoção
          pet.status === 'Adotado'    ? 'bg-secondary'     : // Cinza = já foi adotado
          'bg-warning text-dark'                              // Amarelo = outro status (ex: Em análise)
        }`}>
          {/* Texto do badge exibe o valor do status */}
          {pet.status}
        </span>

        {/* ── Área da foto do pet com altura fixa e overflow oculto ── */}
        <div style={{
          height: '240px',                          // Altura fixa para padronizar todos os cards
          overflow: 'hidden',                        // Garante que imagens maiores não ultrapassem o container
          backgroundColor: '#f8f9fa',               // Fundo cinza claro quando não há foto
          borderRadius: '8px 8px 0 0'               // Bordas arredondadas somente no topo
        }}>

          {/* Se o pet tiver URL de foto, exibe a imagem; senão exibe placeholder */}
          {pet.fotoUrl ? (
            <img 
              src={pet.fotoUrl}   // URL da foto vinda do Firestore/Storage
              alt={pet.nome}      // Texto alternativo para acessibilidade
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}  // Preenche o espaço sem distorcer a imagem
            />
          ) : (
            // Placeholder exibido quando não há foto cadastrada
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <span className="fs-1">📷</span>                  {/* Ícone de câmera grande */}
              <span className="small">Sem foto cadastrada</span> {/* Legenda pequena */}
            </div>
          )}
        </div>

        {/* ── Corpo do card com as informações textuais do pet ── */}
        <div className="card-body d-flex flex-column">

          {/* Nome do pet em negrito e destaque */}
          <h4 className="card-title fw-bold text-dark mb-1">{pet.nome}</h4>

          {/* Espécie e raça (raça exibida somente se existir, precedida de '•') */}
          <p className="text-secondary mb-3 small">
            {pet.especie} {pet.raca ? `• ${pet.raca}` : ''}
          </p>

          {/* ── Bloco de informações rápidas: Idade e Sexo lado a lado ── */}
          <div className="row g-2 mb-4 bg-light p-2 rounded text-center small">

            {/* Coluna da Idade com borda direita separando das outras colunas */}
            <div className="col-6 border-end">
              <span className="text-muted d-block">Idade</span>
              {/* Exibe a idade em anos; traço caso não informada */}
              <strong>{pet.idade ? `${pet.idade} ano(s)` : '—'}</strong>
            </div>

            {/* Coluna do Sexo */}
            <div className="col-6">
              <span className="text-muted d-block">Sexo</span>
              {/* Exibe o sexo; traço caso não informado */}
              <strong>{pet.sexo || '—'}</strong>
            </div>
          </div>

          {/* ── Botões de ação no rodapé do card ── */}
          {/* 'mt-auto' empurra os botões para o final do card mesmo com alturas diferentes */}
          <div className="d-flex gap-2 mt-auto">

            {/* Botão Editar: chama a função onEditar passando o objeto pet completo */}
            <button 
              className="btn btn-outline-primary btn-sm flex-grow-1"
              onClick={() => onEditar(pet)}   // Retorna o pet inteiro para o componente pai editar
            >
              ✏️ Editar
            </button>

            {/* Botão Excluir: chama a função onExcluir passando apenas o ID do pet */}
            <button 
              className="btn btn-outline-danger btn-sm flex-grow-1"
              onClick={() => onExcluir(pet.id)}   // Passa só o ID pois é o suficiente para deletar
            >
              🗑️ Excluir
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Exporta o componente para ser usado em listas/grids de pets
export default PetRow;