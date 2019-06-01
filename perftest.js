console.groupCollapsed('Same Domain tests');
    _rqmgr.currentUrl = 'https://www.example.com/sub/path';

    console.time('single run');
    _rqmgr.checkUrl('https://www.example.com/sub/path');
    console.timeEnd('single run');

    console.time('100 runs');
    for(var x=0;x<100;x++){
        _rqmgr.checkUrl('https://www.example.com/sub/path');
    }
    console.timeEnd('100 runs');
    
    console.time('1000 runs');
    for(var x=0;x<1000;x++){
        _rqmgr.checkUrl('https://www.example.com/sub/path');
    }
    console.timeEnd('1000 runs')

console.groupEnd('Same Domain tests');

console.groupCollapsed('3P Domain tests');
    console.groupCollapsed('No parameters');
        _rqmgr.currentUrl = 'https://www.3P.com/sub/path';

        console.time('single run');
        _rqmgr.checkUrl('https://www.example.com/sub/path');
        console.timeEnd('single run');

        console.time('100 runs');
        for(var x=0;x<100;x++){
            _rqmgr.checkUrl('https://www.example.com/sub/path');
        }
        console.timeEnd('100 runs');
        
        console.time('1000 runs');
        for(var x=0;x<1000;x++){
            _rqmgr.checkUrl('https://www.example.com/sub/path');
        }
        console.timeEnd('1000 runs')
    console.groupEnd('No parameters');
    console.groupCollapsed('Parameters 1P domain');
        _rqmgr.currentUrl = 'https://www.3P.com/sub/path';

        console.time('single run');
        _rqmgr.checkUrl('https://www.example.com/sub/path');
        console.timeEnd('single run');

        console.time('100 runs');
        for(var x=0;x<100;x++){
            _rqmgr.checkUrl('https://www.example.com/sub/path');
        }
        console.timeEnd('100 runs');
        
        console.time('1000 runs');
        for(var x=0;x<1000;x++){
            _rqmgr.checkUrl('https://www.example.com/sub/path');
        }
        console.timeEnd('1000 runs')
    console.groupEnd('Parameters 1P domain');

    console.groupCollapsed('Parameters 1P domain + 3P domain');
        _rqmgr.currentUrl = 'https://www.3P.com/sub/path?p1=1&p2=2&p3=3&p4=4';

        console.time('single run');
        _rqmgr.checkUrl('https://www.example.com/sub/path?p1=1&p2=2&p3=3&p4=4');
        console.timeEnd('single run');

        console.time('100 runs');
        for(var x=0;x<100;x++){
            _rqmgr.checkUrl('https://www.example.com/sub/path?p1=1&p2=2&p3=3&p4=4');
        }
        console.timeEnd('100 runs');
        
        console.time('1000 runs');
        for(var x=0;x<1000;x++){
            _rqmgr.checkUrl('https://www.example.com/sub/path?p1=1&p2=2&p3=3&p4=4');
        }
        console.timeEnd('1000 runs')
    console.groupEnd('Parameters 1P domainParameters 1P domain + 3P domain');

    console.groupCollapsed('Parameters 1P domain + 3P domain + whitelist');
        _rqmgr.currentUrl = 'https://www.3P.com/sub/path?p1=1&p2=2&p3=3&p4=4';
        _rqmgr.whitelistKeys = ['p2','p4'];

    console.time('single run');
        _rqmgr.checkUrl('https://www.example.com/sub/path?p1=1&p2=2&p3=3&p4=4');
    console.timeEnd('single run');

    console.time('100 runs');
        for (var x = 0; x < 100; x++) {
            _rqmgr.checkUrl('https://www.example.com/sub/path?p1=1&p2=2&p3=3&p4=4');
        }
    console.timeEnd('100 runs');

    console.time('1000 runs');
        for (var x = 0; x < 1000; x++) {
            _rqmgr.checkUrl('https://www.example.com/sub/path?p1=1&p2=2&p3=3&p4=4');
        }
    console.timeEnd('1000 runs')
    console.groupEnd('Parameters 1P domainParameters 1P domain + 3P domain');
console.groupEnd('3P Domain tests');