const consultas = [
    {
      pacienteID: "pacienteID_1",
      pacienteNome: "Paciente 1",
      title: "Consulta de Rotina",
      start: "2023-12-14T09:00:00",
      end: "2023-12-14T10:00:00",
      resourceId: "resourceID_1",
      recorrencia: {
        frequency: "Mensal",
        interval: 1,
      },
      consultaRecorrenteID: "consultaID_1",
      tipoDeConsulta: "Presencial",
      observacao: "Sem observações",
      statusDaConsulta: "Confirmada",
      createdAt: "2023-12-14T08:00:00",
      alunoID: "alunoID_1",
    },
    {
      pacienteID: "pacienteID_2",
      pacienteNome: "Paciente 2",
      title: "Consulta de Acompanhamento",
      start: "2023-12-15T10:00:00",
      end: "2023-12-15T11:00:00",
      resourceId: "resourceID_2",
      recorrencia: {
        frequency: "Semanal",
        interval: 2,
      },
      consultaRecorrenteID: "consultaID_2",
      tipoDeConsulta: "Online",
      observacao: "Pressão arterial elevada",
      statusDaConsulta: "Confirmada",
      createdAt: "2023-12-15T09:00:00",
      alunoID: "alunoID_2",
    },
    {
      pacienteID: "pacienteID_3",
      pacienteNome: "Paciente 3",
      title: "Consulta de Avaliação",
      start: "2023-12-16T14:00:00",
      end: "2023-12-16T15:00:00",
      resourceId: "resourceID_3",
      recorrencia: {
        frequency: "Única",
        interval: null,
      },
      consultaRecorrenteID: null,
      tipoDeConsulta: "Presencial",
      observacao: "Necessita de exames complementares",
      statusDaConsulta: "Confirmada",
      createdAt: "2023-12-16T13:00:00",
      alunoID: "alunoID_3",
    },
    {
      pacienteID: "pacienteID_4",
      pacienteNome: "Paciente 4",
      title: "Consulta de Resultados",
      start: "2023-12-17T16:00:00",
      end: "2023-12-17T17:00:00",
      resourceId: "resourceID_4",
      recorrencia: {
        frequency: "Única",
        interval: null,
      },
      consultaRecorrenteID: null,
      tipoDeConsulta: "Presencial",
      observacao: "Trazer resultados de exames anteriores",
      statusDaConsulta: "Confirmada",
      createdAt: "2023-12-17T15:00:00",
      alunoID: "alunoID_4",
    },
  ];
  
  export default consultas;
  