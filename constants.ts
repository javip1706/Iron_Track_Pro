import { ExerciseBase, MuscleGroup } from './types';

export const INITIAL_EXERCISES: ExerciseBase[] = [
  {
    id: "ex_bi_predicador",
    muscleGroup: MuscleGroup.Biceps,
    name: "Curl Avanzado",
    variants: [
      {
        id: "v_bi_pred_maq",
        name: "Máquina"
      },
      {
        id: "v_1764589162476",
        name: "Banco predicador barra Z"
      },
      {
        id: "v_1764589187436",
        name: "Banco predicador mancuerna 1 brazo"
      },
      {
        id: "v_1764589197404",
        name: "Banco predicador mancuernas 2 brazos"
      },
      {
        id: "v_1764589289115",
        name: "Cuclillas torre poleas "
      },
      {
        id: "v_1764589305844",
        name: "Cuclillas Catedral poleas "
      },
      {
        id: "v_1764594400839",
        name: "Concentrado Mancuerna 1 brazo"
      },
      {
        id: "v_1764594521422",
        name: "Banco Spider mancuernas"
      }
    ]
  },
  {
    id: "ex_bi_martillo",
    muscleGroup: MuscleGroup.Biceps,
    name: "Martillo",
    variants: [
      {
        id: "v_bi_mar_manc",
        name: "Martillo Mancuernas"
      },
      {
        id: "v_1764589421836",
        name: "Martillo cuerda torre poleas "
      },
      {
        id: "v_1764589436827",
        name: "Martillo cuerda Catedral poleas "
      }
    ]
  },
  {
    id: "ex_bi_curl",
    muscleGroup: MuscleGroup.Biceps,
    name: "Curl de pie",
    variants: [
      {
        id: "v_bi_curl_conc2",
        name: "Concentrado 2 poleas altas"
      },
      {
        id: "v_bi_curl_pie",
        name: "Barra recta de pie"
      },
      {
        id: "v_bi_curl_manc",
        name: "Mancuernas"
      },
      {
        id: "v_1764586892243",
        name: "Barra barra Z de pie"
      },
      {
        id: "v_1764594461127",
        name: "Barra recta Catedral poleas"
      },
      {
        id: "v_1764594472743",
        name: "Barra recta Torre poleas"
      }
    ]
  },
  {
    id: "ex_bi_reclinado",
    muscleGroup: MuscleGroup.Biceps,
    name: "Curl reclinado",
    variants: [
      {
        id: "v_bi_rec_manc",
        name: "Mancuernas"
      }
    ]
  },
  {
    id: "ex_tri_frances",
    muscleGroup: MuscleGroup.Triceps,
    name: "Press Frances",
    variants: [
      {
        id: "v_tri_fr_bz",
        name: "Banco barra Z"
      },
      {
        id: "v_tri_fr_manc",
        name: "Banco mancuernas"
      },
      {
        id: "v_1764594675628",
        name: "Banco Catedral Poleas"
      },
      {
        id: "v_1764594683732",
        name: "Banco Torre Poleas"
      }
    ]
  },
  {
    id: "ex_tri_poleas",
    muscleGroup: MuscleGroup.Triceps,
    name: "Poleas",
    variants: [
      {
        id: "v_1764595121945",
        name: "Polea alta delante Catedral cuerdas"
      },
      {
        id: "v_1764595128921",
        name: "Polea alta delante Torre cuerdas"
      },
      {
        id: "v_1764595135721",
        name: "Polea alta delante Catedral barra recta"
      },
      {
        id: "v_1764595142889",
        name: "Polea alta delante Torre barra recta"
      },
      {
        id: "v_1764595149209",
        name: "Polea alta Catedral cuerdas"
      },
      {
        id: "v_1764595157384",
        name: "Polea alta Torre cuerdas"
      },
      {
        id: "v_1764595163856",
        name: "Polea alta Catedral barra recta"
      },
      {
        id: "v_1764595168969",
        name: "Polea alta Torre barra recta"
      },
      {
        id: "v_1764595175184",
        name: "Polea alta Catedral barra \"V\""
      },
      {
        id: "v_1764595182601",
        name: "Polea alta Torre barra \"V\""
      },
      {
        id: "v_1764595188585",
        name: "Patada trasera Torre poleas"
      },
      {
        id: "v_1764595194465",
        name: "Patada trasera Catedral poleas"
      },
      {
        id: "v_1764595203400",
        name: "Polea alta 1 brazo Torre"
      },
      {
        id: "v_1764595205529",
        name: "Polea alta 1 brazo Catedral"
      }
    ]
  },
  {
    id: "ex_tri_curl",
    muscleGroup: MuscleGroup.Triceps,
    name: "Curl / Extensión",
    variants: [
      {
        id: "v_tri_tras_m1",
        name: "Trasnuca mancuerna 1 brazo"
      },
      {
        id: "v_tri_tras_m2",
        name: "Trasnuca mancuerna 2 brazos"
      },
      {
        id: "v_1764594722132",
        name: "Patada mancuerna"
      },
      {
        id: "v_1764595255128",
        name: "Extensión máquina avanzado"
      }
    ]
  },
  {
    id: "ex_tri_fondos",
    muscleGroup: MuscleGroup.Triceps,
    name: "Fondos",
    variants: [
      {
        id: "v_tri_fon_par",
        name: "Fondos Paralelas"
      },
      {
        id: "v_tri_fon_banc",
        name: "Fondos Banco"
      },
      {
        id: "v_tri_fon_flex",
        name: "Fondos flexiones"
      }
    ]
  },
  {
    id: "ex_abs_gen",
    muscleGroup: MuscleGroup.Abdominales,
    name: "Ejercicios Abdominales",
    variants: [
      {
        id: "v_abs_maq",
        name: "Máquina"
      },
      {
        id: "v_abs_banco",
        name: "Banco"
      },
      {
        id: "v_abs_lat",
        name: "Laterales suelo"
      },
      {
        id: "v_abs_esp",
        name: "Espalderas"
      },
      {
        id: "v_abs_enco",
        name: "Encogmiento piernas fonderas"
      },
      {
        id: "v_abs_elev",
        name: "Elevación piernas fonderas"
      },
      {
        id: "v_abs_rod",
        name: "Rodillo"
      },
      {
        id: "v_abs_rod_brazos",
        name: "Rodillo apoyo brazos"
      },
      {
        id: "v_abs_placa",
        name: "Placa ruedines"
      },
      {
        id: "v_abs_pinza",
        name: "Pinza completa sobre fitball"
      },
      {
        id: "v_abs_tor",
        name: "Torsion lateral sobre trx"
      },
      {
        id: "v_abs_abslat",
        name: "Abdominales laterales"
      },
      {
        id: "v_abs_combi",
        name: "Combi sobre TRX"
      },
      {
        id: "v_abs_inv",
        name: "Contracciones invertidas"
      }
    ]
  },
  {
    id: "ex_leg_fem",
    muscleGroup: MuscleGroup.Piernas,
    name: "Femoral",
    variants: [
      {
        id: "v_leg_pm",
        name: "Peso muerto"
      },
      {
        id: "v_leg_fem_tum",
        name: "Femoral tumbado"
      },
      {
        id: "v_leg_fem_sen",
        name: "Femoral sentado"
      }
    ]
  },
  {
    id: "ex_leg_cuad",
    muscleGroup: MuscleGroup.Piernas,
    name: "Cuádriceps",
    variants: [
      {
        id: "v_leg_ext",
        name: "Extension sentado"
      },
      {
        id: "v_leg_ext_mul",
        name: "Extension sentado multi"
      },
      {
        id: "v_leg_sen_bul",
        name: "Sentadilla Búlgara"
      },
      {
        id: "v_leg_sen_mul",
        name: "Sentadillas multipower"
      },
      {
        id: "v_leg_pren_dis",
        name: "Prensa discos"
      },
      {
        id: "v_leg_pren_pla",
        name: "Prensa placas"
      },
      {
        id: "v_leg_zan",
        name: "Zancadas"
      }
    ]
  },
  {
    id: "ex_leg_glute",
    muscleGroup: MuscleGroup.Piernas,
    name: "Gluteos",
    variants: [
      {
        id: "v_leg_glu_maq",
        name: "Máquina glúteos"
      }
    ]
  },
  {
    id: "ex_leg_gem",
    muscleGroup: MuscleGroup.Piernas,
    name: "Gemelos",
    variants: [
      {
        id: "v_leg_gem_esc",
        name: "Escalera"
      },
      {
        id: "v_leg_gem_maq",
        name: "Máquina gemelos"
      }
    ]
  },
  {
    id: "ex_leg_abd",
    muscleGroup: MuscleGroup.Piernas,
    name: "Abductores",
    variants: [
      {
        id: "v_leg_abd_maq",
        name: "Máquina abductores"
      }
    ]
  },
  {
    id: "ex_sho_press",
    muscleGroup: MuscleGroup.Hombro,
    name: "Press Militar",
    variants: [
      {
        id: "v_sho_bar_pie",
        name: "Barra de pie"
      },
      {
        id: "v_sho_sen_manc",
        name: "Sentado mancuernas"
      },
      {
        id: "v_sho_maq_d_cer",
        name: "Maquina hombro discos agarre cerrado"
      },
      {
        id: "v_sho_maq_d_abi",
        name: "Maquina hombro discos agarre abierto"
      },
      {
        id: "v_sho_maq_p_abi",
        name: "Maquina hombro placas agarre abierto"
      },
      {
        id: "v_sho_maq_p_cer",
        name: "Maquina hombro placas agarre cerrado"
      },
      {
        id: "v_sho_maq_p_var",
        name: "Maquina hombro placas variable"
      }
    ]
  },
  {
    id: "ex_sho_post",
    muscleGroup: MuscleGroup.Hombro,
    name: "Posterior",
    variants: [
      {
        id: "v_sho_ap_maq",
        name: "Apertura dorsal máquina"
      },
      {
        id: "v_sho_paj_manc",
        name: "Pájaro Mancuernas"
      },
      {
        id: "v_1764595370776",
        name: "Polea media 1 brazo Torre"
      },
      {
        id: "v_1764595380328",
        name: "Polea media 1 brazo Catedral"
      }
    ]
  },
  {
    id: "ex_sho_lat",
    muscleGroup: MuscleGroup.Hombro,
    name: "Elevación Lateral",
    variants: [
      {
        id: "v_sho_lat_maq",
        name: "Máquina"
      },
      {
        id: "v_sho_lat_manc",
        name: "Mancuernas"
      },
      {
        id: "v_1764595416735",
        name: "Polea 1 brazo Torre"
      },
      {
        id: "v_1764595430024",
        name: "Polea 1 brazo Catedral"
      }
    ]
  },
  {
    id: "ex_sho_fron",
    muscleGroup: MuscleGroup.Hombro,
    name: "Elevación frontal",
    variants: [
      {
        id: "v_sho_fro_manc",
        name: "Mancuernas"
      },
      {
        id: "v_sho_fro_disc",
        name: "Disco"
      },
      {
        id: "v_1764595462031",
        name: "Polea Baja entre piernas barra recta Torre"
      },
      {
        id: "v_1764595471231",
        name: "Polea Baja entre piernas barra recta Catedral"
      }
    ]
  },
  {
    id: "ex_sho_trap",
    muscleGroup: MuscleGroup.Hombro,
    name: "Trapecio",
    variants: [
      {
        id: "v_sho_enco",
        name: "Encogimientos mancuernas"
      },
      {
        id: "v_sho_trap_inc",
        name: "Trapecio banco inclinado"
      },
      {
        id: "v_1764595526983",
        name: "Face Pull cuerda Torre poleas"
      },
      {
        id: "v_1764595543743",
        name: "Face Pull cuerda Catedral poleas"
      },
      {
        id: "v_1764595574223",
        name: "Elevación barra recta Torre poleas"
      },
      {
        id: "v_1764595577574",
        name: "Elevación barra recta Catedral poleas"
      }
    ]
  },
  {
    id: "ex_pec_inc",
    muscleGroup: MuscleGroup.Pecho,
    name: "Press inclinado",
    variants: [
      {
        id: "v_pec_inc_mul",
        name: "Multipower"
      },
      {
        id: "v_pec_inc_ban",
        name: "Banco"
      },
      {
        id: "v_pec_inc_manc",
        name: "Mancuernas"
      },
      {
        id: "v_pec_inc_maq",
        name: "Maquina placas"
      },
      {
        id: "v_1764595665175",
        name: "Maquina placas ventana"
      }
    ]
  },
  {
    id: "ex_pec_ban",
    muscleGroup: MuscleGroup.Pecho,
    name: "Press banca",
    variants: [
      {
        id: "v_pec_ban_mul",
        name: "Multipower"
      },
      {
        id: "v_pec_ban_ban",
        name: "Banco"
      },
      {
        id: "v_pec_ban_manc",
        name: "Mancuernas"
      },
      {
        id: "v_pec_ban_maq",
        name: "Maquina placas"
      },
      {
        id: "v_pec_ban_ven",
        name: "Maquina placas ventana"
      },
      {
        id: "v_pec_ban_flex",
        name: "Flexiones"
      },
      {
        id: "v_1764595626351",
        name: "Máquina discos agarre abierto"
      },
      {
        id: "v_1764595635991",
        name: "Máquina discos agarre cerrado"
      }
    ]
  },
  {
    id: "ex_pec_aper",
    muscleGroup: MuscleGroup.Pecho,
    name: "Aperturas",
    variants: [
      {
        id: "v_pec_ap_ban",
        name: "Banco mancuernas"
      },
      {
        id: "v_pec_ap_maq",
        name: "Máquina aperturas"
      },
      {
        id: "v_1764595716878",
        name: "Aperturas mancuernas banco inclinado"
      }
    ]
  },
  {
    id: "ex_pec_con",
    muscleGroup: MuscleGroup.Pecho,
    name: "Contractora",
    variants: [
      {
        id: "v_1764595870686",
        name: "Polea baja Torre"
      },
      {
        id: "v_1764595876998",
        name: "Polea baja Catedral "
      },
      {
        id: "v_1764595883526",
        name: "Polea media Torre"
      },
      {
        id: "v_1764595889102",
        name: "Polea media Catedral"
      },
      {
        id: "v_1764595894005",
        name: "Polea alta Torre"
      },
      {
        id: "v_1764595899606",
        name: "Polea alta Catedral "
      },
      {
        id: "v_1764595908022",
        name: "Polea baja Torre 1 brazo"
      },
      {
        id: "v_1764595913910",
        name: "Polea baja Catedral 1 brazo"
      },
      {
        id: "v_1764595922246",
        name: "Polea media Torre 1 brazo"
      },
      {
        id: "v_1764595928701",
        name: "Polea media Catedral 1 brazo"
      },
      {
        id: "v_1764595933773",
        name: "Polea alta Torre 1 brazo"
      },
      {
        id: "v_1764595941382",
        name: "Polea alta Catedral 1 brazo "
      }
    ]
  },
  {
    id: "ex_pec_fon",
    muscleGroup: MuscleGroup.Pecho,
    name: "Fondos",
    variants: [
      {
        id: "v_pec_fon_par",
        name: "Fondos paralelas"
      }
    ]
  },
  {
    id: "ex_pec_dec",
    muscleGroup: MuscleGroup.Pecho,
    name: "Press declinado",
    variants: [
      {
        id: "v_pec_dec_ban",
        name: "Banco multipower"
      },
      {
        id: "v_pec_dec_ven",
        name: "Máquina ventana"
      }
    ]
  },
  {
    id: "ex_esp_pm",
    muscleGroup: MuscleGroup.Espalda,
    name: "Peso muerto",
    variants: [
      {
        id: "v_esp_pm_rum",
        name: "PM Rumano"
      },
      {
        id: "v_esp_pm_manc",
        name: "PM Mancuernas"
      }
    ]
  },
  {
    id: "ex_esp_rbajo",
    muscleGroup: MuscleGroup.Espalda,
    name: "Remo bajo",
    variants: [
      {
        id: "v_esp_rb_manc1",
        name: "Remo con mancuerna a un brazo"
      },
      {
        id: "v_esp_rb_barra",
        name: "Remo con barra"
      },
      {
        id: "v_esp_rb_maqd",
        name: "Máquina discos"
      },
      {
        id: "v_esp_rb_maqp",
        name: "Máquina placas"
      },
      {
        id: "v_1764596330933",
        name: "Banco Catedral agarre cerrado"
      },
      {
        id: "v_1764596340477",
        name: "Banco Catedral agarre abierto"
      },
      {
        id: "v_1764596358941",
        name: "Banco Espalda agarre cerrado"
      },
      {
        id: "v_1764596376652",
        name: "Banco Espalda agarre abierto"
      },
      {
        id: "v_1764596384844",
        name: "Remo a 1 mano en polea baja Torre"
      },
      {
        id: "v_1764596395293",
        name: "Remo a 1 mano en polea baja Catedral"
      },
      {
        id: "v_1764596490892",
        name: "Remo en polea baja Torre"
      },
      {
        id: "v_1764596495804",
        name: "Remo en polea baja Catedral"
      }
    ]
  },
  {
    id: "ex_esp_ralto",
    muscleGroup: MuscleGroup.Espalda,
    name: "Remo Alto",
    variants: [
      {
        id: "v_esp_ra_binc",
        name: "Banco inclinado mancuernas"
      },
      {
        id: "v_esp_ra_bar",
        name: "Remo con barra"
      },
      {
        id: "v_esp_ra_maqd",
        name: "Máquina discos"
      },
      {
        id: "v_esp_ra_maqp",
        name: "Máquina placas"
      }
    ]
  },
  {
    id: "ex_esp_jalon",
    muscleGroup: MuscleGroup.Espalda,
    name: "Jalón",
    variants: [
      {
        id: "v_esp_jal_maqd",
        name: "Máquina discos"
      },
      {
        id: "v_esp_jal_maqp",
        name: "Máquina placas"
      },
      {
        id: "v_1764596634708",
        name: "Banco Espalda a pecho"
      },
      {
        id: "v_1764596640780",
        name: "Banco Catedral a pecho"
      },
      {
        id: "v_1764596645365",
        name: "Banco Espalda Trasnuca"
      },
      {
        id: "v_1764596665048",
        name: "Banco Catedral Trasnuca"
      },
      {
        id: "v_1764596658444",
        name: "Banco Espalda 1 mano"
      },
      {
        id: "v_1764596665284",
        name: "Banco Catedral 1 mano"
      }
    ]
  },
  {
    id: "ex_esp_dom",
    muscleGroup: MuscleGroup.Espalda,
    name: "Dominadas",
    variants: [
      {
        id: "v_esp_dom_aa",
        name: "Agarre abierto"
      },
      {
        id: "v_esp_dom_ac",
        name: "Agarre cerrado"
      },
      {
        id: "v_esp_dom_mul",
        name: "Dominadas Multipower"
      }
    ]
  },
  {
    id: "ex_esp_pull",
    muscleGroup: MuscleGroup.Espalda,
    name: "Pullover",
    variants: [
      {
        id: "v_1764596728964",
        name: "Polea alta barra recta Torre"
      },
      {
        id: "v_1764596739436",
        name: "Polea alta barra recta Catedral "
      },
      {
        id: "v_1764596745660",
        name: "Banco mancuerna"
      }
    ]
  },
  {
    id: "ex_cardio_bici",
    muscleGroup: MuscleGroup.Cardio,
    name: "Bicicleta",
    variants: [
      {
        id: "v_card_bici_std",
        name: "Estándar"
      },
      {
        id: "v_card_bici_est",
        name: "Estática"
      }
    ]
  },
  {
    id: "ex_cardio_eli",
    muscleGroup: MuscleGroup.Cardio,
    name: "Elíptica",
    variants: [
      {
        id: "v_card_eli_std",
        name: "Estándar"
      }
    ]
  },
  {
    id: "ex_cardio_cin",
    muscleGroup: MuscleGroup.Cardio,
    name: "Cinta",
    variants: [
      {
        id: "v_card_cin_std",
        name: "Estándar"
      }
    ]
  }
];