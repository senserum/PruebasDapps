//const Web3 = require("web3")

const web3 = new Web3("http://localhost:7545")
//traigo el bloque 0, solo para joder y ver como lo resuelve
web3.eth.getBlockNumber(function (error, result) {
  console.log('el numero de bloque='+result)
})

//import Web3 from 'web3';

//**************ACA ARRANCA LA APP **************************************************************************************/

App = {
    loading: false,
    contracts: {
      contract_tdl:{}
    },
    load: async () =>{
        // load app...
        console.log("app loading...");
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },
 
    
// cosito de nueva web3
  loadWeb3: async () => {
    //const Web3 = require('web3');
    if(window.ethereum) {
      App.web3Provider = window.ethereum
      const web3 = new Web3(window.ethereum);
      await ethereum.enable();
      console.log("entre por billetera metamask ya instalada")
      //ahora ya se puede usar Metamask
      //este es el caso que tienen otra billetera 
    } else if(window.web3) {
      web3 = new Web3(window.web3.currentProvider);
      console.log("entre por billetera rara")
    }
    else {
      App.web3Provider = new Web3('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
      console.log('No se detectó browser con compatibilidad ethereum, se seteó la red local. Probá con MetaMask guacho!');
     }
    //ahora ya podemos usar web3

    //const accounts = await web3.eth.getAccounts();
    //var userAccount = accounts[0];
  },
  //hasta acá lo que armé para conectarme a la metamask 
  
  loadAccount: async () => {
    
      let accounts = await web3.eth.getAccounts();
      App.account = accounts[0]
      //web3.eth.defaultAccount = web3.eth.accounts[0]
      console.log('Esta es la cuenta de Metamask cargada='+App.account)
  },
  
  loadContract: async () => {
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.contract_tdl = TruffleContract(todoList)
    console.log("este es el contrato")
    console.log(App.contracts.contract_tdl)
    App.contracts.contract_tdl.setProvider(App.web3Provider)
    
    App.contracts.contract_tdl = await App.contracts.contract_tdl.deployed()

    //console.log(todoList)
  },

  render: async () => {
    //prevengo doble render
    if(App.loading) {
      return
    }

    //actualizo estado de Loading
    App.setLoading(true)

    //entrego la cuenta
    $('#account1').html(App.account)

    //render tasks
    await App.renderTasks()

    //actualizo estado de loading
    App.setLoading(false)

  },

  renderTasks: async() => {
    // Cargar las tareas totales que haya en la blockchain
    const taskCount = await App.contracts.contract_tdl.taskCount()
    console.log("taskCount CARGADO")
    console.log(taskCount)
    const $taskTemplate = $('.taskTemplate')
    
    // Render cada tarea con una nueva plantilla
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.contracts.contract_tdl.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]
  //TaskTemplate es una seccion del DOM, son una lista con unos div.
  //Acá lo que hacemos es clonar el modelo del DOM para tasktemplate y rellenarlo con la info de la blockchain 
      const $newTaskTemplate = $taskTemplate.clone()
      //aca busco la clase content dentro del newTaskTemplate clonado, y le asigno el contenido del primer registro 
      //que saque de la blockchain
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.marcarCompletado)

      //pongo la tarea en la lista correspondiente (completa o incompleta)
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)

      } else {
        $('#taskList').append($newTaskTemplate)
      }
      
      // Mostrar la tarea
      $newTaskTemplate.show()
    }

  },

  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    await App.contracts.contract_tdl.createTask(content, { from: App.account})
    window.location.reload()
  },

  marcarCompletado: async (e) => {

    App.setLoading(true)
    const taskId = e.target.name
    await App.contracts.contract_tdl.marcarCompletado(taskId, { from: App.account})
    window.location.reload()


  },


  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }

}


$(() => {
    $(window).load(()=> {
      
        App.load()
    })

})
