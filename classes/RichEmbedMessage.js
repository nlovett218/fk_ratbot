class RichEmbedMessage {
  constructor(title, body, color, image, author, footer, fields)
  {
    this.title = title;
    this.body = body;
    this.color = color;
    this.image = image;
    this.author = author;
    this.author_icon = author_icon;
    this.footer = footer;
    this.fields = fields;
  }
}

/*const embed = new Discord.RichEmbed()
.setTitle("magic cards are dumb")
.setColor(0x105ad1)

.setDescription("text based stats are also dumb.")
.setImage("https://i.imgur.com/XxblI2S.jpg")
.addField("name", "value", inLine)

message.channel.send({embed});*/
