// sentence の ___ が空欄。日本語訳によって正解が一意になる問題です。
export const questions = [
 ['I ___ money.','お金を貯めます。','save','safe'],
 ['This place is ___.','この場所は安全です。','safe','save'],
 ['I ___ a cat.','猫を飼っています。','have','hate'],
 ['I ___ up early.','私は早起きします。','wake','walk'],
 ['I ___ to school.','私は歩いて学校に行きます。','walk','work'],
 ['I ___ at home.','私は家で働きます。','work','walk'],
 ['Please ___ here.','ここで待ってください。','wait','want'],
 ['I ___ some tea.','お茶が欲しいです。','want','wait'],
 ['I ___ your name.','あなたの名前を知っています。','know','now'],
 ['Come here ___.','今、ここに来てください。','now','know'],
 ['I can ___ you.','あなたの声が聞こえます。','hear','here'],
 ['Sit ___, please.','ここに座ってください。','here','hear'],
 ['Please ___ your name.','名前を書いてください。','write','right'],
 ['Turn ___.','右に曲がってください。','right','light'],
 ['I ___ a book every day.','私は毎日本を読みます。','read','red'],
 ['This apple is ___.','このリンゴは赤いです。','red','read'],
 ['I ___ my friend.','私は友達に会います。','meet','meat'],
 ['I eat ___.','私は肉を食べます。','meat','meet'],
 ['The ___ is blue.','海は青いです。','sea','see'],
 ['I ___ a bird.','鳥が見えます。','see','sea'],
].map(([sentence,translation,answer,other],id)=>({id:id+1,sentence,translation,answer,other}));
export const meanings = {save:'貯める・救う',safe:'安全な',have:'持っている・飼っている',hate:'嫌う',wake:'目を覚ます（wake up）',walk:'歩く',work:'働く',wait:'待つ',want:'欲しい',know:'知っている',now:'今',hear:'聞こえる',here:'ここ',write:'書く',right:'右・正しい',light:'光・軽い',read:'読む',red:'赤い',meet:'会う',meat:'肉',sea:'海',see:'見える'};
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
