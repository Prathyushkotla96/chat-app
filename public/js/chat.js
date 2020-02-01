const socket=io()

const $messageform=document.querySelector('#message-form')
const $messageformInput=$messageform.querySelector('input')
const $messageformButton=$messageform.querySelector('button')
const $sendlocationbutton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationmessageTemplate=document.querySelector('#locationmessage-template').innerHTML



socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)


})

socket.on('locationmessage',(message)=>{
    //console.log(url)
    const html=Mustache.render(locationmessageTemplate,{
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageformButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value=''
        $messageformInput.focus()
        if (error){
            return console.log(error)
        }
        console.log('the message was delivered!')
    })

})

$sendlocationbutton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendlocationbutton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendlocationbutton.removeAttribute('disabled')
            console.log('location shared')
        })

    })
})