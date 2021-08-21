var members = ['park', 'gongwon', 'tester'];
console.log(members[1]);
var i = 0;
while (i < members.length) {
    console.log('array loop => ', members[i]);
    i += 1;
}

var roles = {
    'programmer': 'park',
    'designer': 'gongwon',
    'manager': 'tester'
}
console.log(roles.programmer);

for (var name in roles) {
    console.log('object => ', name, '/ value => ', roles[name]);
}