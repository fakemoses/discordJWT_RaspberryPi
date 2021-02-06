const { Client, MessageAttachment, MessageEmbed, Message } = require('discord.js');
const client = new Client()
const path = require('path')
require('dotenv').config()
var http = require('http');
const express = require('express');
const { getUserToken, addNewTodoList, getAllList, updateTheList, deleteTheList } = require('./httprequest');


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT

app.use(express.static(path.join(__dirname, 'public')))

server.listen(PORT, () => console.log('Server running on port ', PORT))

var token = ''
var commandList = ["!list", "!add", "!get", "!edit", "!delete"]
var date = new Date()


client.on('ready', () => {
    //request for token everytime discord bot is up. This will however not going to update the token once it is expired.
    getUserToken(process.env.EMAIL, process.env.PASSWORD)
        .then(res => {
            token = res
        }
        )
    console.log('Bot is up')
})

//discord bit main part 
client.on('message', msg => {
    var showId = false

    //list all the thing
    if (msg.content.search(commandList[0]) >= 0 && !msg.author.bot) {
        //trim the commmand 
        if (msg.content.search('-id') >= 0) {
            showId = true
            tmp = msg.content.replace('-id', '')
            task = msg.content.replace(commandList[0], '')
        } else {
            task = msg.content.replace(commandList[0], '')
        }
        getAllList(token)
            .then(res => {
                //console.log(res)
                var content = []
                var tmp = []
                if (res['code'] == 200) {
                    //get the data object and loop each of them to get the task
                    dataObject = res['data'][0]

                    //put all the messages in list
                    for (let i = 0; i < dataObject.length; i++) {
                        element = dataObject[i]
                        if (showId == true) {
                            id = element['id']
                            toSend = element['task']

                            //create a key value obj

                            value = "[" + id + "] " + toSend,

                                //push into array
                                content.push(value)

                            tmp = []
                        } else {
                            toSend = element['task']

                            content.push(toSend)


                        }
                    }
                    showId = false
                    //console.log(content)
                    //Discordjs Embed
                    const embed = new MessageEmbed()
                        .setTitle("Current Todo List")

                    for (let index = 0; index < content.length; index++) {
                        embed.addFields({ name: "Task " + index, value: content[index] })
                    }

                    msg.channel.send(embed)
                    content = []

                }
                else {
                    msg.channel.send('Todo list is empty! use !add command to add')
                }
            })
    }


    // add new list
    if (msg.content.search(commandList[1]) >= 0 && !msg.author.bot) {
        //trim the commmand. Need to remake here since there's extra white space at the start
        const args = msg.content.slice(commandList[3].length).trim().split(' ')
        if (args.length == 1) {
            msg.channel.send("Please give the arguments! For help type !help")
        } else {
            task = msg.content.replace(commandList[1], '')
            addNewTodoList(token, task, process.env.EMAIL, date)
                .then(res => {
                    //need to settle this part
                    //response once it is successfull
                    console.log(res)

                    if (res['code'] == 200) {
                        var embed = new MessageEmbed
                        embed
                        .setTitle("New task successfully added")
                        .addFields(
                            {name: 'Task', value: task},
                            {name: 'Created By', value: process.env.EMAIL},
                            {name: 'Date Created', value: date},
                        )

                        msg.channel.send(embed)
                    } else {
                        msg.channel.send('Invalid ID! Operation is unsuccessful')
                    }
                })
        }

    }

    //update the list
    if (msg.content.search(commandList[3]) >= 0 && !msg.author.bot) {
        // check if there is argument
        const args = msg.content.slice(commandList[3].length).trim().split(' ');
        if (args.length == 1) {
            msg.channel.send("Please give the arguments! For help type !help")
        } else {

            //edit the informations
            //user only needs to edit the task
            //user + date will be automatically inserted
            //second argument is the id, third is the new edited task

            var id = args[0]
            var content = msg.content.slice(parseInt(commandList[3].length) + 1).trim()
            var removeID = content.slice(25).trim()
            console.log(removeID)

            //check if the id is unique. it must be a 12-byte input or a 24-character hex string
            if (id.length != 24) {
                msg.channel.send("Please enter a valid ID. For help type !help. To list all tasks type !list")
            } else {
                updateTheList(token, id, content, process.env.EMAIL, date)
                    .then(res => {
                        if (res['code'] == 200) {
                            var embed = new MessageEmbed

                            embed
                                .setTitle("Task updated!")
                                .addFields(
                                    { name: "Task", value: removeID }
                                )

                            msg.channel.send(embed)
                        } else {
                            msg.channel.send("Task with the id does not exists. Please enter a valid ID. For help type !help. To list all tasks type !list")
                        }
                    })
            }


        }
    }


    //Delete 
    if (msg.content.search(commandList[4]) >= 0 && !msg.author.bot) {

        const args = msg.content.slice(commandList[4].length).trim().split(' ');
        if (args.length == 0) {
            msg.channel.send("Please give the arguments! For help type !help")
        } else {
            var id = args[0]
            
            console.log(args[0])

            if (id.length != 24) {
                msg.channel.send("Please enter a valid ID. For help type !help. To list all tasks type !list")
            } else {

                deleteTheList(token, id)
                    .then(res => {
                        //need to settle this part
                        //response once it is successfull
                        console.log(res)

                        if (res['code'] == 200) {
                            msg.channel.send('Task with id: ' + id + ' has been successfully deleted')
                        } else {
                            msg.channel.send('Invalid ID! Operation is unsuccessful')
                        }
                    })
            }
        }

    }

});

client.login(process.env.DISCORD_TOKEN)
