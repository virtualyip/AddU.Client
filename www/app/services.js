
angular.module('come_rice.services', [])

.factory('UserService', function() {
  return {
    get: function() {
      var userString = window.localStorage['come_rice_user'];
      if(userString) {
        return angular.fromJson(userString);
      }
      return [];
    },
    save: function(user) {
      window.localStorage['come_rice_user'] = angular.toJson(user);
    },
    get_info: function() {
      var userString = window.localStorage['come_rice_user_info'];
      if(userString) {
        return angular.fromJson(userString);
      }
      return [];
    },
    save_info: function(user_info) {
      window.localStorage['come_rice_user_info'] = angular.toJson(user_info);
    },
    clear: function() {
      window.localStorage['come_rice_user'] = '';
      window.localStorage['come_rice_user_info'] = '';
    },
    save_cfg: function(key, value) {
      
      var user_cfg = window.localStorage['come_rice_user_cfg'];
      if(!user_cfg){
        user_cfg = {};
      }else{
        user_cfg = angular.fromJson(user_cfg);
      }
      user_cfg[key] = value;
      window.localStorage['come_rice_user_cfg'] = angular.toJson(user_cfg);
    },
    get_cfg: function(key, default_value) {
      var cfg = window.localStorage['come_rice_user_cfg'];
      if(cfg) {
        var user_cfg = angular.fromJson(cfg);
        return user_cfg[key] != null ? user_cfg[key] : default_value;
      }
      return default_value;
    },
    clear_cfg: function(){
      window.localStorage['come_rice_user_cfg'] = "";
    }
  };
});


var area_mapping =
      {'region':{'hk':{'text':'香港島', checked:false, 
                       'district': {'0hk':{text:'不定', checked:false},
                                    'cwb':{text:'銅鑼灣', checked:false},
                                    'wc' :{text:'灣仔', checked:false},
                                    'ku' :{text:'港大', checked:false},
                                    'cw' :{text:'柴灣', checked:false},
                                    'lkf':{text:'籣桂坊', checked:false},
                                    'th' :{text:'天后', checked:false},
                                    'tk' :{text:'太古', checked:false},
                                    'np' :{text:'北角', checked:false},
                                    'hh' :{text:'半山', checked:false},
                                    'so' :{text:'石澳', checked:false},
                                    'sw' :{text:'上環', checked:false},
                                    'ssw':{text:'西環', checked:false},
                                    'stl':{text:'赤柱', checked:false},
                                    'adm':{text:'金鐘', checked:false},
                                    'swh':{text:'西灣河', checked:false},
                                    'hfc':{text:'杏花村', checked:false},
                                    'cw' :{text:'香港仔', checked:false},
                                    'rpb':{text:'淺水灣', checked:false},
                                    'dwb':{text:'深水灣', checked:false},
                                    'hpv':{text:'跑馬地', checked:false},
                                    'skw':{text:'筲簧灣', checked:false},
                                    'alc':{text:'鴨脷洲', checked:false},
                                    'pfl':{text:'薄扶林', checked:false},
                                    'dih':{text:'數碼港', checked:false},
                                    'qb' :{text:'鰂魚涌', checked:false},
                                    'fh' :{text:'炮台山', checked:false},
                                    'zot':{text:'其他', checked:false}
                                   }
                      },
                 'kln':{'text':'九龍', checked:false,
                       'district': {'0kln':{text:'不定', checked:false},
                                    'kt' :{text:'觀塘', checked:false},
                                    'yt' :{text:'油塘', checked:false},
                                    'pe' :{text:'太子', checked:false},
                                    'jd' :{text:'佐敦', checked:false},
                                    'pu' :{text:'理大', checked:false},
                                    'ctu':{text:'城大', checked:false},
                                    'hh' :{text:'紅磡', checked:false},
                                    'mf' :{text:'美孚', checked:false},
                                    'ch' :{text:'彩虹', checked:false},
                                    'lf' :{text:'樂富', checked:false},
                                    'lt' :{text:'藍田', checked:false},
                                    'klc':{text:'九龍城', checked:false},
                                    'klt':{text:'九龍塘', checked:false},
                                    'klb':{text:'九龍灣', checked:false},
                                    'tkw':{text:'土瓜灣', checked:false},
                                    'tkc':{text:'大角咀', checked:false},
                                    'ntk':{text:'牛頭角', checked:false},
                                    'skm':{text:'石硤尾', checked:false},
                                    'tst':{text:'尖沙咀', checked:false},
                                    'hmt':{text:'何文田', checked:false},
                                    'ymt':{text:'油麻地', checked:false},
                                    'csw':{text:'長沙灣', checked:false},
                                    'lck':{text:'荔枝角', checked:false},
                                    'ssp':{text:'深水埗', checked:false},
                                    'wts':{text:'黃大仙', checked:false},
                                    'tws':{text:'慈雲山', checked:false},
                                    'spk':{text:'新蒲崗', checked:false},
                                    'dh' :{text:'鑽石山', checked:false},
                                    'zot':{text:'其他', checked:false}
                                   }
                      },
                 'nt':{'text':'新界', checked:false,
                       'district': {'0nt':{text:'不定', checked:false},
                                    'st' :{text:'沙田', checked:false},
                                    'twa':{text:'大圍', checked:false},
                                    'ss' :{text:'上水', checked:false},
                                    'ust':{text:'科大', checked:false},
                                    'tp' :{text:'大埔', checked:false},
                                    'uni':{text:'大學', checked:false},
                                    'yl' :{text:'元朗', checked:false},
                                    'two':{text:'太和', checked:false},
                                    'tm' :{text:'屯門', checked:false},
                                    'ft' :{text:'火炭', checked:false},
                                    'sk' :{text:'西貢', checked:false},
                                    'ty' :{text:'青衣', checked:false},
                                    'fl' :{text:'粉嶺', checked:false},
                                    'tw' :{text:'荃灣', checked:false},
                                    'sc' :{text:'深并', checked:false},
                                    'kf' :{text:'葵芳', checked:false},
                                    'kc' :{text:'葵涌', checked:false},
                                    'lw' :{text:'羅湖', checked:false},
                                    'tsw':{text:'天水圍', checked:false},
                                    'lfs':{text:'流浮山', checked:false},
                                    'mos':{text:'馬鞍山', checked:false},
                                    'tko':{text:'將運澳', checked:false},
                                    'pl' :{text:'寶林', checked:false},
                                    'zot':{text:'其他', checked:false}
                                   }
                      },
                 'ot':{'text':'離島', checked:false,
                       'district': {'0ot':{text:'不定', checked:false},
                                    'to' :{text:'大澳', checked:false},
                                    'pc' :{text:'坪洲', checked:false},
                                    'tc' :{text:'東涌', checked:false},
                                    'cc' :{text:'長洲', checked:false},
                                    'lti':{text:'大嶼山', checked:false},
                                    'dcb':{text:'愉景灣', checked:false},
                                    'zot':{text:'其他', checked:false}
                                   }
                      },
                 'zot':{'text':'未定', checked:false, 
                         'district': {'zot':{text:'未定', checked:false}
                                   }
                       }                                   
                }
      };
      
