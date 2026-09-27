window.SKA_LINEAGE = {
  width: 780,
  height: 1260,
  nodes: [
    {id:"mento-rnb", label:"Mento / R&B", year:1952, x:360, tags:["jamaica"], summary:"Mento、米国R&B、サウンドシステム文化が、のちのSKAを生む土台になった。", article:"./genres/mento-rnb.html"},
    {id:"ska", label:"SKA", year:1961, x:360, tags:["jamaica","ska"], summary:"1960年代初頭のジャマイカで形になった、速く跳ねるオフビートの音楽。", article:"./genres/ska.html"},
    {id:"rocksteady", label:"Rocksteady", year:1966, x:360, tags:["jamaica","rocksteady"], summary:"SKAよりテンポが落ち、ベースとヴォーカルが前に出た短く濃い時代。", article:"./genres/rocksteady.html"},
    {id:"reggae", label:"Early Reggae", year:1968, x:360, tags:["jamaica","reggae"], summary:"Rocksteadyからリズムが変化し、Reggaeと呼ばれる新しいスタイルが定着していく。", article:"./genres/reggae.html"},
    {id:"roots", label:"Roots Reggae", year:1971, x:145, tags:["jamaica","roots"], summary:"Rastafari、社会、政治、アフリカ意識を強く打ち出した70年代の大きな流れ。", article:"./genres/roots-reggae.html"},
    {id:"dub", label:"Dub", year:1972, x:555, tags:["jamaica","dub"], summary:"ミキサー、エコー、リバーブを使い、録音そのものを再構成する音楽。スタジオが楽器になった。", article:"./genres/dub.html"},
    {id:"dancehall", label:"Dancehall", year:1978, x:360, tags:["jamaica","dancehall"], summary:"サウンドシステムとダンスの現場を軸に、Deejayの存在感がさらに強くなった時代。", article:"./genres/dancehall.html"},
    {id:"two-tone", label:"2 Tone", year:1979, x:690, tags:["uk","ska"], summary:"英国でSKA / RocksteadyとPunk / New Waveが接続。The Specialsらが新しいSKAを鳴らした。", article:"./genres/two-tone.html"},
    {id:"digital", label:"Digital Dancehall", year:1985, x:360, tags:["jamaica","dancehall","digital"], summary:"Sleng Tengを象徴に、打ち込み主体のRiddimが主流化。制作方法そのものが変わった。", article:"./genres/digital-dancehall.html"},
    {id:"ragga", label:"Ragga", year:1988, x:360, tags:["jamaica","dancehall","ragga"], summary:"デジタル化したDancehallがさらに硬質化。DeejayやSingjayのスタイルも大きく広がった。", article:"./genres/ragga.html"},
    {id:"third-wave", label:"Third Wave Ska", year:1990, x:690, tags:["usa","ska"], summary:"米国を中心にSKAとPunkが大きく接続し、90年代に世界へ広がった。", article:"./genres/third-wave.html"},
    {id:"reggae-fusion", label:"Reggae Fusion", year:2000, x:525, tags:["jamaica","dancehall"], summary:"Dancehallを軸にHip-Hop、R&B、Popとの融合が進み、世界的なヒットへつながった。", article:"./genres/reggae-fusion.html"},
    {id:"reggae-revival", label:"Reggae Revival", year:2011, x:145, tags:["jamaica","roots","modern"], summary:"Roots Reggaeの思想やバンドサウンドを、若い世代が現代の感覚で再接続した流れ。", article:"./genres/reggae-revival.html"},
    {id:"trap-dancehall", label:"Trap Dancehall", year:2016, x:360, tags:["jamaica","dancehall","modern"], summary:"Trapの808やハイハット、暗い音像を取り込んだ現代Dancehallの大きな流れ。", article:"./genres/trap-dancehall.html"},
    {id:"modern", label:"Jamaica Now", year:2024, x:360, tags:["jamaica","dancehall","modern"], summary:"Dancehall、Trap Dancehall、現代Roots、Pop、Hip-Hop、Afrobeatsとの往来が同時進行している。", article:"./genres/jamaica-now.html"}
  ],
  edges: [
    {from:"mento-rnb",to:"ska",type:"main"},
    {from:"ska",to:"rocksteady",type:"main"},
    {from:"rocksteady",to:"reggae",type:"main"},
    {from:"reggae",to:"dancehall",type:"main"},
    {from:"dancehall",to:"digital",type:"main"},
    {from:"digital",to:"ragga",type:"main"},
    {from:"ragga",to:"trap-dancehall",type:"main"},
    {from:"trap-dancehall",to:"modern",type:"main"},

    {from:"reggae",to:"roots",type:"branch"},
    {from:"roots",to:"reggae-revival",type:"branch"},
    {from:"reggae-revival",to:"modern",type:"branch"},
    {from:"reggae",to:"dub",type:"branch"},
    {from:"ska",to:"two-tone",type:"branch"},
    {from:"two-tone",to:"third-wave",type:"branch"},
    {from:"dancehall",to:"reggae-fusion",type:"branch"},
    {from:"reggae-fusion",to:"modern",type:"branch"}
  ]
};