const { assert } = require("chai")

const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {
    before(async () => {
        this.todoList = await TodoList.deployed()
    })

    it('deploys successfully', async () => {
      const address = await this.todoList.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)

    })

    it('lists tasks', async () => {
     const taskCount = await this.todoList.taskCount()   
     const task = await this.todoList.tasks(taskCount)
     assert.equal(task.id.toNumber(), taskCount.toNumber())
     assert.equal(task.content, 'Chequea nic0strip en youtube')
     assert.equal(task.completed, false)
     assert.equal(taskCount.toNumber(), 1)
    })

    it('crea una tarea nueva', async () => {
      const result = await this.todoList.createTask('tarea nueva')
      const taskCount = await this.todoList.taskCount()
      assert.equal(taskCount.toNumber(), 2)
      console.log(result)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), 2)
      assert.equal(event.content, 'tarea nueva')
      assert.equal(event.completed, false)

    })

    it('marca una tarea como completada', async () => {
      const result2 = await this.todoList.marcarCompletado(1)
      const task2 = await this.todoList.tasks(1)
      assert.equal(task2.completed, true)
      console.log(result2)
      const event2 = result2.logs[0].args
      assert.equal(event2.id.toNumber(), 1)
      assert.equal(event2.completed, true)

    })

})
