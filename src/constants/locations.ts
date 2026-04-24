export interface Region {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  regions: Region[];
}

export const COUNTRIES: Country[] = [
  {
    id: 'ES',
    name: 'España',
    nameEn: 'Spain',
    flag: '🇪🇸',
    regions: [
      { id: 'AN', name: 'Andalucía' },
      { id: 'AR', name: 'Aragón' },
      { id: 'AS', name: 'Asturias' },
      { id: 'IB', name: 'Baleares' },
      { id: 'CN', name: 'Canarias' },
      { id: 'CB', name: 'Cantabria' },
      { id: 'CL', name: 'Castilla y León' },
      { id: 'CM', name: 'Castilla-La Mancha' },
      { id: 'CT', name: 'Cataluña' },
      { id: 'VC', name: 'Comunidad Valenciana' },
      { id: 'EX', name: 'Extremadura' },
      { id: 'GA', name: 'Galicia' },
      { id: 'MD', name: 'Madrid' },
      { id: 'MC', name: 'Murcia' },
      { id: 'NC', name: 'Navarra' },
      { id: 'PV', name: 'País Vasco' },
      { id: 'RI', name: 'La Rioja' },
      { id: 'CE', name: 'Ceuta' },
      { id: 'ML', name: 'Melilla' }
    ]
  },
  {
    id: 'MX',
    name: 'México',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    regions: [
      { id: 'AG', name: 'Aguascalientes' },
      { id: 'BC', name: 'Baja California' },
      { id: 'BS', name: 'Baja California Sur' },
      { id: 'CM', name: 'Campeche' },
      { id: 'CS', name: 'Chiapas' },
      { id: 'CH', name: 'Chihuahua' },
      { id: 'CO', name: 'Coahuila' },
      { id: 'CL', name: 'Colima' },
      { id: 'DF', name: 'Ciudad de México' },
      { id: 'DG', name: 'Durango' },
      { id: 'GT', name: 'Guanajuato' },
      { id: 'GR', name: 'Guerrero' },
      { id: 'HG', name: 'Hidalgo' },
      { id: 'JA', name: 'Jalisco' },
      { id: 'ME', name: 'México' },
      { id: 'MI', name: 'Michoacán' },
      { id: 'MO', name: 'Morelos' },
      { id: 'NA', name: 'Nayarit' },
      { id: 'NL', name: 'Nuevo León' },
      { id: 'OA', name: 'Oaxaca' },
      { id: 'PU', name: 'Puebla' },
      { id: 'QT', name: 'Querétaro' },
      { id: 'QR', name: 'Quintana Roo' },
      { id: 'SL', name: 'San Luis Potosí' },
      { id: 'SI', name: 'Sinaloa' },
      { id: 'SO', name: 'Sonora' },
      { id: 'TB', name: 'Tabasco' },
      { id: 'TM', name: 'Tamaulipas' },
      { id: 'TL', name: 'Tlaxcala' },
      { id: 'VE', name: 'Veracruz' },
      { id: 'YU', name: 'Yucatán' },
      { id: 'ZA', name: 'Zacatecas' }
    ]
  },
  {
    id: 'US',
    name: 'USA',
    nameEn: 'USA',
    flag: '🇺🇸',
    regions: [
      { id: 'AL', name: 'Alabama' },
      { id: 'AK', name: 'Alaska' },
      { id: 'AZ', name: 'Arizona' },
      { id: 'AR', name: 'Arkansas' },
      { id: 'CA', name: 'California' },
      { id: 'CO', name: 'Colorado' },
      { id: 'CT', name: 'Connecticut' },
      { id: 'DE', name: 'Delaware' },
      { id: 'FL', name: 'Florida' },
      { id: 'GA', name: 'Georgia' },
      { id: 'HI', name: 'Hawaii' },
      { id: 'ID', name: 'Idaho' },
      { id: 'IL', name: 'Illinois' },
      { id: 'IN', name: 'Indiana' },
      { id: 'IA', name: 'Iowa' },
      { id: 'KS', name: 'Kansas' },
      { id: 'KY', name: 'Kentucky' },
      { id: 'LA', name: 'Louisiana' },
      { id: 'ME', name: 'Maine' },
      { id: 'MD', name: 'Maryland' },
      { id: 'MA', name: 'Massachusetts' },
      { id: 'MI', name: 'Michigan' },
      { id: 'MN', name: 'Minnesota' },
      { id: 'MS', name: 'Mississippi' },
      { id: 'MO', name: 'Missouri' },
      { id: 'MT', name: 'Montana' },
      { id: 'NE', name: 'Nebraska' },
      { id: 'NV', name: 'Nevada' },
      { id: 'NH', name: 'New Hampshire' },
      { id: 'NJ', name: 'New Jersey' },
      { id: 'NM', name: 'New Mexico' },
      { id: 'NY', name: 'New York' },
      { id: 'NC', name: 'North Carolina' },
      { id: 'ND', name: 'North Dakota' },
      { id: 'OH', name: 'Ohio' },
      { id: 'OK', name: 'Oklahoma' },
      { id: 'OR', name: 'Oregon' },
      { id: 'PA', name: 'Pennsylvania' },
      { id: 'RI', name: 'Rhode Island' },
      { id: 'SC', name: 'South Carolina' },
      { id: 'SD', name: 'South Dakota' },
      { id: 'TN', name: 'Tennessee' },
      { id: 'TX', name: 'Texas' },
      { id: 'UT', name: 'Utah' },
      { id: 'VT', name: 'Vermont' },
      { id: 'VA', name: 'Virginia' },
      { id: 'WA', name: 'Washington' },
      { id: 'WV', name: 'West Virginia' },
      { id: 'WI', name: 'Wisconsin' },
      { id: 'WY', name: 'Wyoming' }
    ]
  },
  {
    id: 'CO',
    name: 'Colombia',
    nameEn: 'Colombia',
    flag: '🇨🇴',
    regions: [
      { id: 'AM', name: 'Amazonas' },
      { id: 'AN', name: 'Antioquia' },
      { id: 'AR', name: 'Arauca' },
      { id: 'AT', name: 'Atlántico' },
      { id: 'BO', name: 'Bolívar' },
      { id: 'BY', name: 'Boyacá' },
      { id: 'CA', name: 'Caldas' },
      { id: 'CQ', name: 'Caquetá' },
      { id: 'CS', name: 'Casanare' },
      { id: 'CU', name: 'Cauca' },
      { id: 'CE', name: 'Cesar' },
      { id: 'CH', name: 'Chocó' },
      { id: 'CO', name: 'Córdoba' },
      { id: 'CU', name: 'Cundinamarca' },
      { id: 'GU', name: 'Guainía' },
      { id: 'GV', name: 'Guaviare' },
      { id: 'HU', name: 'Huila' },
      { id: 'LG', name: 'La Guajira' },
      { id: 'MA', name: 'Magdalena' },
      { id: 'ME', name: 'Meta' },
      { id: 'NA', name: 'Nariño' },
      { id: 'NS', name: 'Norte de Santander' },
      { id: 'PU', name: 'Putumayo' },
      { id: 'QU', name: 'Quindío' },
      { id: 'RI', name: 'Risaralda' },
      { id: 'SA', name: 'San Andrés y Providencia' },
      { id: 'SA', name: 'Santander' },
      { id: 'SU', name: 'Sucre' },
      { id: 'TO', name: 'Tolima' },
      { id: 'VC', name: 'Valle del Cauca' },
      { id: 'VA', name: 'Vaupés' },
      { id: 'VI', name: 'Vichada' }
    ]
  },
  {
    id: 'AR',
    name: 'Argentina',
    nameEn: 'Argentina',
    flag: '🇦🇷',
    regions: [
      { id: 'BA', name: 'Buenos Aires' },
      { id: 'CB', name: 'CABA' },
      { id: 'CT', name: 'Catamarca' },
      { id: 'CH', name: 'Chaco' },
      { id: 'CU', name: 'Chubut' },
      { id: 'CD', name: 'Córdoba' },
      { id: 'CR', name: 'Corrientes' },
      { id: 'ER', name: 'Entre Ríos' },
      { id: 'FO', name: 'Formosa' },
      { id: 'JU', name: 'Jujuy' },
      { id: 'LP', name: 'La Pampa' },
      { id: 'LR', name: 'La Rioja' },
      { id: 'MZ', name: 'Mendoza' },
      { id: 'MI', name: 'Misiones' },
      { id: 'NE', name: 'Neuquén' },
      { id: 'RN', name: 'Río Negro' },
      { id: 'SA', name: 'Salta' },
      { id: 'SJ', name: 'San Juan' },
      { id: 'SL', name: 'San Luis' },
      { id: 'SC', name: 'Santa Cruz' },
      { id: 'SF', name: 'Santa Fe' },
      { id: 'SE', name: 'Santiago del Estero' },
      { id: 'TF', name: 'Tierra del Fuego' },
      { id: 'TU', name: 'Tucumán' }
    ]
  },
  {
    id: 'CL',
    name: 'Chile',
    nameEn: 'Chile',
    flag: '🇨🇱',
    regions: [
      { id: 'AI', name: 'Aisén' },
      { id: 'AN', name: 'Antofagasta' },
      { id: 'AR', name: 'Araucanía' },
      { id: 'AP', name: 'Arica y Parinacota' },
      { id: 'AT', name: 'Atacama' },
      { id: 'BI', name: 'Biobío' },
      { id: 'CO', name: 'Coquimbo' },
      { id: 'LI', name: 'Libertador General Bernardo O\'Higgins' },
      { id: 'LL', name: 'Los Lagos' },
      { id: 'LR', name: 'Los Ríos' },
      { id: 'MA', name: 'Magallanes y de la Antártica Chilena' },
      { id: 'ML', name: 'Maule' },
      { id: 'RM', name: 'Metropolitana de Santiago' },
      { id: 'NB', name: 'Ñuble' },
      { id: 'TA', name: 'Tarapacá' },
      { id: 'VS', name: 'Valparaíso' }
    ]
  },
  {
    id: 'PE',
    name: 'Perú',
    nameEn: 'Peru',
    flag: '🇵🇪',
    regions: [
      { id: 'AM', name: 'Amazonas' },
      { id: 'AN', name: 'Ancash' },
      { id: 'AP', name: 'Apurímac' },
      { id: 'AR', name: 'Arequipa' },
      { id: 'AY', name: 'Ayacucho' },
      { id: 'CA', name: 'Cajamarca' },
      { id: 'CL', name: 'Callao' },
      { id: 'CU', name: 'Cusco' },
      { id: 'HV', name: 'Huancavelica' },
      { id: 'HU', name: 'Huánuco' },
      { id: 'IC', name: 'Ica' },
      { id: 'JU', name: 'Junín' },
      { id: 'LL', name: 'La Libertad' },
      { id: 'LA', name: 'Lambayeque' },
      { id: 'LI', name: 'Lima' },
      { id: 'LO', name: 'Loreto' },
      { id: 'MD', name: 'Madre de Dios' },
      { id: 'MO', name: 'Moquegua' },
      { id: 'PA', name: 'Pasco' },
      { id: 'PI', name: 'Piura' },
      { id: 'PU', name: 'Puno' },
      { id: 'SM', name: 'San Martín' },
      { id: 'TA', name: 'Tacna' },
      { id: 'TU', name: 'Tumbes' },
      { id: 'UC', name: 'Ucayali' }
    ]
  },
  {
    id: 'PT',
    name: 'Portugal',
    nameEn: 'Portugal',
    flag: '🇵🇹',
    regions: [
      { id: 'AV', name: 'Aveiro' },
      { id: 'BE', name: 'Beja' },
      { id: 'BR', name: 'Braga' },
      { id: 'BG', name: 'Bragança' },
      { id: 'CB', name: 'Castelo Branco' },
      { id: 'CO', name: 'Coimbra' },
      { id: 'EV', name: 'Évora' },
      { id: 'FA', name: 'Faro' },
      { id: 'GU', name: 'Guarda' },
      { id: 'LE', name: 'Leiria' },
      { id: 'LI', name: 'Lisboa' },
      { id: 'PO', name: 'Portalegre' },
      { id: 'PR', name: 'Porto' },
      { id: 'SA', name: 'Santarém' },
      { id: 'SE', name: 'Setúbal' },
      { id: 'VC', name: 'Viana do Castelo' },
      { id: 'VR', name: 'Vila Real' },
      { id: 'VI', name: 'Viseu' },
      { id: 'AC', name: 'Açores' },
      { id: 'MA', name: 'Madeira' }
    ]
  },
  {
    id: 'FR',
    name: 'Francia',
    nameEn: 'France',
    flag: '🇫🇷',
    regions: [
      { id: 'ARA', name: 'Auvergne-Rhône-Alpes' },
      { id: 'BFC', name: 'Bourgogne-Franche-Comté' },
      { id: 'BRE', name: 'Bretagne' },
      { id: 'CVL', name: 'Centre-Val de Loire' },
      { id: 'COR', name: 'Corse' },
      { id: 'GES', name: 'Grand Est' },
      { id: 'HDF', name: 'Hauts-de-France' },
      { id: 'IDF', name: 'Île-de-France' },
      { id: 'NOR', name: 'Normandie' },
      { id: 'NAQ', name: 'Nouvelle-Aquitaine' },
      { id: 'OCC', name: 'Occitanie' },
      { id: 'PDL', name: 'Pays de la Loire' },
      { id: 'PAC', name: 'Provence-Alpes-Côte d\'Azur' }
    ]
  },
  {
    id: 'IT',
    name: 'Italia',
    nameEn: 'Italy',
    flag: '🇮🇹',
    regions: [
      { id: 'ABR', name: 'Abruzzo' },
      { id: 'BAS', name: 'Basilicata' },
      { id: 'CAL', name: 'Calabria' },
      { id: 'CAM', name: 'Campania' },
      { id: 'EMR', name: 'Emilia-Romagna' },
      { id: 'FVG', name: 'Friuli-Venezia Giulia' },
      { id: 'LAZ', name: 'Lazio' },
      { id: 'LIG', name: 'Liguria' },
      { id: 'LOM', name: 'Lombardia' },
      { id: 'MAR', name: 'Marche' },
      { id: 'MOL', name: 'Molise' },
      { id: 'PIE', name: 'Piemonte' },
      { id: 'PUG', name: 'Puglia' },
      { id: 'SAR', name: 'Sardegna' },
      { id: 'SIC', name: 'Sicilia' },
      { id: 'TOS', name: 'Toscana' },
      { id: 'TAA', name: 'Trentino-Alto Adige' },
      { id: 'UMB', name: 'Umbria' },
      { id: 'VDA', name: 'Valle d\'Aosta' },
      { id: 'VEN', name: 'Veneto' }
    ]
  },
  {
    id: 'DE',
    name: 'Alemania',
    nameEn: 'Germany',
    flag: '🇩🇪',
    regions: [
      { id: 'BW', name: 'Baden-Württemberg' },
      { id: 'BY', name: 'Bayern' },
      { id: 'BE', name: 'Berlin' },
      { id: 'BB', name: 'Brandenburg' },
      { id: 'HB', name: 'Bremen' },
      { id: 'HH', name: 'Hamburg' },
      { id: 'HE', name: 'Hessen' },
      { id: 'MV', name: 'Mecklenburg-Vorpommern' },
      { id: 'NI', name: 'Niedersachsen' },
      { id: 'NW', name: 'Nordrhein-Westfalen' },
      { id: 'RP', name: 'Rheinland-Pfalz' },
      { id: 'SL', name: 'Saarland' },
      { id: 'SN', name: 'Sachsen' },
      { id: 'ST', name: 'Sachsen-Anhalt' },
      { id: 'SH', name: 'Schleswig-Holstein' },
      { id: 'TH', name: 'Thüringen' }
    ]
  },
  {
    id: 'UK',
    name: 'Reino Unido',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    regions: [
      { id: 'ENG', name: 'England' },
      { id: 'SCT', name: 'Scotland' },
      { id: 'WLS', name: 'Wales' },
      { id: 'NIR', name: 'Northern Ireland' }
    ]
  },
  {
    id: 'BR',
    name: 'Brasil',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    regions: [
      { id: 'AC', name: 'Acre' },
      { id: 'AL', name: 'Alagoas' },
      { id: 'AP', name: 'Amapá' },
      { id: 'AM', name: 'Amazonas' },
      { id: 'BA', name: 'Bahia' },
      { id: 'CE', name: 'Ceará' },
      { id: 'DF', name: 'Distrito Federal' },
      { id: 'ES', name: 'Espírito Santo' },
      { id: 'GO', name: 'Goiás' },
      { id: 'MA', name: 'Maranhão' },
      { id: 'MT', name: 'Mato Grosso' },
      { id: 'MS', name: 'Mato Grosso do Sul' },
      { id: 'MG', name: 'Minas Gerais' },
      { id: 'PA', name: 'Pará' },
      { id: 'PB', name: 'Paraíba' },
      { id: 'PR', name: 'Paraná' },
      { id: 'PE', name: 'Pernambuco' },
      { id: 'PI', name: 'Piauí' },
      { id: 'RJ', name: 'Rio de Janeiro' },
      { id: 'RN', name: 'Rio Grande do Norte' },
      { id: 'RS', name: 'Rio Grande do Sul' },
      { id: 'RO', name: 'Rondônia' },
      { id: 'RR', name: 'Roraima' },
      { id: 'SC', name: 'Santa Catarina' },
      { id: 'SP', name: 'São Paulo' },
      { id: 'SE', name: 'Sergipe' },
      { id: 'TO', name: 'Tocantins' }
    ]
  },
  {
    id: 'EC',
    name: 'Ecuador',
    nameEn: 'Ecuador',
    flag: '🇪🇨',
    regions: [
      { id: 'AZ', name: 'Azuay' },
      { id: 'BO', name: 'Bolívar' },
      { id: 'CA', name: 'Cañar' },
      { id: 'CA', name: 'Carchi' },
      { id: 'CH', name: 'Chimborazo' },
      { id: 'CO', name: 'Cotopaxi' },
      { id: 'EL', name: 'El Oro' },
      { id: 'ES', name: 'Esmeraldas' },
      { id: 'GA', name: 'Galápagos' },
      { id: 'GU', name: 'Guayas' },
      { id: 'IM', name: 'Imbabura' },
      { id: 'LO', name: 'Loja' },
      { id: 'LR', name: 'Los Ríos' },
      { id: 'MA', name: 'Manabí' },
      { id: 'MS', name: 'Morona Santiago' },
      { id: 'NA', name: 'Napo' },
      { id: 'OR', name: 'Orellana' },
      { id: 'PA', name: 'Pastaza' },
      { id: 'PI', name: 'Pichincha' },
      { id: 'SE', name: 'Santa Elena' },
      { id: 'SD', name: 'Santo Domingo de los Tsáchilas' },
      { id: 'SU', name: 'Sucumbíos' },
      { id: 'TU', name: 'Tungurahua' },
      { id: 'ZC', name: 'Zamora Chinchipe' }
    ]
  },
  {
    id: 'VE',
    name: 'Venezuela',
    nameEn: 'Venezuela',
    flag: '🇻🇪',
    regions: [
      { id: 'AM', name: 'Amazonas' },
      { id: 'AN', name: 'Anzoátegui' },
      { id: 'AP', name: 'Apure' },
      { id: 'AR', name: 'Aragua' },
      { id: 'BA', name: 'Barinas' },
      { id: 'BO', name: 'Bolívar' },
      { id: 'CA', name: 'Carabobo' },
      { id: 'CO', name: 'Cojedes' },
      { id: 'DA', name: 'Delta Amacuro' },
      { id: 'DC', name: 'Distrito Capital' },
      { id: 'FA', name: 'Falcón' },
      { id: 'GU', name: 'Guárico' },
      { id: 'LA', name: 'Lara' },
      { id: 'ME', name: 'Mérida' },
      { id: 'MI', name: 'Miranda' },
      { id: 'MO', name: 'Monagas' },
      { id: 'NE', name: 'Nueva Esparta' },
      { id: 'PO', name: 'Portuguesa' },
      { id: 'SU', name: 'Sucre' },
      { id: 'TA', name: 'Táchira' },
      { id: 'TR', name: 'Trujillo' },
      { id: 'VA', name: 'Vargas' },
      { id: 'YA', name: 'Yaracuy' },
      { id: 'ZU', name: 'Zulia' }
    ]
  },
  {
    id: 'GT',
    name: 'Guatemala',
    nameEn: 'Guatemala',
    flag: '🇬🇹',
    regions: [
      { id: 'AV', name: 'Alta Verapaz' },
      { id: 'BV', name: 'Baja Verapaz' },
      { id: 'CM', name: 'Chimaltenango' },
      { id: 'CQ', name: 'Chiquimula' },
      { id: 'EP', name: 'El Progreso' },
      { id: 'ES', name: 'Escuintla' },
      { id: 'GU', name: 'Guatemala' },
      { id: 'HU', name: 'Huehuetenango' },
      { id: 'IZ', name: 'Izabal' },
      { id: 'JA', name: 'Jalapa' },
      { id: 'JU', name: 'Jutiapa' },
      { id: 'PE', name: 'Petén' },
      { id: 'QZ', name: 'Quetzaltenango' },
      { id: 'QU', name: 'Quiché' },
      { id: 'RE', name: 'Retalhuleu' },
      { id: 'SA', name: 'Sacatepéquez' },
      { id: 'SM', name: 'San Marcos' },
      { id: 'SR', name: 'Santa Rosa' },
      { id: 'SO', name: 'Sololá' },
      { id: 'SU', name: 'Suchitepéquez' },
      { id: 'TO', name: 'Totonicapán' },
      { id: 'ZA', name: 'Zacapa' }
    ]
  },
  {
    id: 'BO',
    name: 'Bolivia',
    nameEn: 'Bolivia',
    flag: '🇧🇴',
    regions: [
      { id: 'BE', name: 'Beni' },
      { id: 'CH', name: 'Chuquisaca' },
      { id: 'CO', name: 'Cochabamba' },
      { id: 'LP', name: 'La Paz' },
      { id: 'OR', name: 'Oruro' },
      { id: 'PA', name: 'Pando' },
      { id: 'PO', name: 'Potosí' },
      { id: 'SC', name: 'Santa Cruz' },
      { id: 'TA', name: 'Tarija' }
    ]
  },
  {
    id: 'PY',
    name: 'Paraguay',
    nameEn: 'Paraguay',
    flag: '🇵🇾',
    regions: [
      { id: 'AS', name: 'Asunción' },
      { id: 'CP', name: 'Concepción' },
      { id: 'SP', name: 'San Pedro' },
      { id: 'CO', name: 'Cordillera' },
      { id: 'GU', name: 'Guairá' },
      { id: 'CA', name: 'Caaguazú' },
      { id: 'CZ', name: 'Caazapá' },
      { id: 'IT', name: 'Itapúa' },
      { id: 'MI', name: 'Misiones' },
      { id: 'PA', name: 'Paraguarí' },
      { id: 'AA', name: 'Alto Paraná' },
      { id: 'CE', name: 'Central' },
      { id: 'NE', name: 'Ñeembucú' },
      { id: 'AM', name: 'Amambay' },
      { id: 'CD', name: 'Canindeyú' },
      { id: 'PH', name: 'Presidente Hayes' },
      { id: 'BO', name: 'Boquerón' },
      { id: 'AG', name: 'Alto Paraguay' }
    ]
  },
  {
    id: 'UY',
    name: 'Uruguay',
    nameEn: 'Uruguay',
    flag: '🇺🇾',
    regions: [
      { id: 'AR', name: 'Artigas' },
      { id: 'CA', name: 'Canelones' },
      { id: 'CL', name: 'Cerro Largo' },
      { id: 'CO', name: 'Colonia' },
      { id: 'DU', name: 'Durazno' },
      { id: 'FS', name: 'Flores' },
      { id: 'FL', name: 'Florida' },
      { id: 'LA', name: 'Lavalleja' },
      { id: 'MA', name: 'Maldonado' },
      { id: 'MO', name: 'Montevideo' },
      { id: 'PA', name: 'Paysandú' },
      { id: 'RN', name: 'Río Negro' },
      { id: 'RI', name: 'Rivera' },
      { id: 'RO', name: 'Rocha' },
      { id: 'SA', name: 'Salto' },
      { id: 'SJ', name: 'San José' },
      { id: 'SO', name: 'Soriano' },
      { id: 'TA', name: 'Tacuarembó' },
      { id: 'TT', name: 'Treinta y Tres' }
    ]
  },
  {
    id: 'CA',
    name: 'Canadá',
    nameEn: 'Canada',
    flag: '🇨🇦',
    regions: [
      { id: 'AB', name: 'Alberta' },
      { id: 'BC', name: 'British Columbia' },
      { id: 'MB', name: 'Manitoba' },
      { id: 'NB', name: 'New Brunswick' },
      { id: 'NL', name: 'Newfoundland and Labrador' },
      { id: 'NS', name: 'Nova Scotia' },
      { id: 'ON', name: 'Ontario' },
      { id: 'PE', name: 'Prince Edward Island' },
      { id: 'QC', name: 'Quebec' },
      { id: 'SK', name: 'Saskatchewan' },
      { id: 'NT', name: 'Northwest Territories' },
      { id: 'NU', name: 'Nunavut' },
      { id: 'YT', name: 'Yukon' }
    ]
  },
  {
    id: 'AD',
    name: 'Andorra',
    nameEn: 'Andorra',
    flag: '🇦🇩',
    regions: [
      { id: 'ALV', name: 'Andorra la Vella' },
      { id: 'CAN', name: 'Canillo' },
      { id: 'ENC', name: 'Encamp' },
      { id: 'ESC', name: 'Escaldes-Engordany' },
      { id: 'MAS', name: 'La Massana' },
      { id: 'ORD', name: 'Ordino' },
      { id: 'JUL', name: 'Sant Julià de Lòria' }
    ]
  },
  {
    id: 'CH',
    name: 'Suiza',
    nameEn: 'Switzerland',
    flag: '🇨🇭',
    regions: [
      { id: 'ZH', name: 'Zürich' },
      { id: 'BE', name: 'Bern' },
      { id: 'LU', name: 'Luzern' },
      { id: 'UR', name: 'Uri' },
      { id: 'SZ', name: 'Schwyz' },
      { id: 'OW', name: 'Obwalden' },
      { id: 'NW', name: 'Nidwalden' },
      { id: 'GL', name: 'Glarus' },
      { id: 'ZG', name: 'Zug' },
      { id: 'FR', name: 'Fribourg' },
      { id: 'SO', name: 'Solothurn' },
      { id: 'BS', name: 'Basel-Stadt' },
      { id: 'BL', name: 'Basel-Landschaft' },
      { id: 'SH', name: 'Schaffhausen' },
      { id: 'AR', name: 'Appenzell Ausserrhoden' },
      { id: 'AI', name: 'Appenzell Innerrhoden' },
      { id: 'SG', name: 'St. Gallen' },
      { id: 'GR', name: 'Graubünden' },
      { id: 'AG', name: 'Aargau' },
      { id: 'TG', name: 'Thurgau' },
      { id: 'TI', name: 'Ticino' },
      { id: 'VD', name: 'Vaud' },
      { id: 'VS', name: 'Valais' },
      { id: 'NE', name: 'Neuchâtel' },
      { id: 'GE', name: 'Genève' },
      { id: 'JU', name: 'Jura' }
    ]
  },
  {
    id: 'AT',
    name: 'Austria',
    nameEn: 'Austria',
    flag: '🇦🇹',
    regions: [
      { id: 'B', name: 'Burgenland' },
      { id: 'K', name: 'Kärnten' },
      { id: 'N', name: 'Niederösterreich' },
      { id: 'O', name: 'Oberösterreich' },
      { id: 'S', name: 'Salzburg' },
      { id: 'ST', name: 'Steiermark' },
      { id: 'T', name: 'Tirol' },
      { id: 'V', name: 'Vorarlberg' },
      { id: 'W', name: 'Wien' }
    ]
  },
  {
    id: 'BE',
    name: 'Bélgica',
    nameEn: 'Belgium',
    flag: '🇧🇪',
    regions: [
      { id: 'BRU', name: 'Bruxelles' },
      { id: 'VLG', name: 'Vlaanderen' },
      { id: 'WAL', name: 'Wallonie' }
    ]
  },
  {
    id: 'NL',
    name: 'Países Bajos',
    nameEn: 'Netherlands',
    flag: '🇳🇱',
    regions: [
      { id: 'DR', name: 'Drenthe' },
      { id: 'FL', name: 'Flevoland' },
      { id: 'FR', name: 'Friesland' },
      { id: 'GE', name: 'Gelderland' },
      { id: 'GR', name: 'Groningen' },
      { id: 'LI', name: 'Limburg' },
      { id: 'NB', name: 'Noord-Brabant' },
      { id: 'NH', name: 'Noord-Holland' },
      { id: 'OV', name: 'Overijssel' },
      { id: 'UT', name: 'Utrecht' },
      { id: 'ZE', name: 'Zeeland' },
      { id: 'ZH', name: 'Zuid-Holland' }
    ]
  },
  {
    id: 'SE',
    name: 'Suecia',
    nameEn: 'Sweden',
    flag: '🇸🇪',
    regions: [
      { id: 'AB', name: 'Stockholm' },
      { id: 'C', name: 'Uppsala' },
      { id: 'D', name: 'Södermanland' },
      { id: 'E', name: 'Östergötland' },
      { id: 'F', name: 'Jönköping' },
      { id: 'G', name: 'Kronoberg' },
      { id: 'H', name: 'Kalmar' },
      { id: 'I', name: 'Gotland' },
      { id: 'K', name: 'Blekinge' },
      { id: 'M', name: 'Skåne' },
      { id: 'N', name: 'Halland' },
      { id: 'O', name: 'Västra Götaland' },
      { id: 'S', name: 'Värmland' },
      { id: 'T', name: 'Örebro' },
      { id: 'U', name: 'Västmanland' },
      { id: 'W', name: 'Dalarna' },
      { id: 'X', name: 'Gävleborg' },
      { id: 'Y', name: 'Västernorrland' },
      { id: 'Z', name: 'Jämtland' },
      { id: 'AC', name: 'Västerbotten' },
      { id: 'BD', name: 'Norrbotten' }
    ]
  },
  {
    id: 'GR',
    name: 'Grecia',
    nameEn: 'Greece',
    flag: '🇬🇷',
    regions: [
      { id: 'A', name: 'Attica' },
      { id: 'B', name: 'Central Greece' },
      { id: 'C', name: 'Central Macedonia' },
      { id: 'D', name: 'Crete' },
      { id: 'E', name: 'East Macedonia and Thrace' },
      { id: 'F', name: 'Epirus' },
      { id: 'G', name: 'Ionian Islands' },
      { id: 'H', name: 'North Aegean' },
      { id: 'I', name: 'Peloponnese' },
      { id: 'J', name: 'South Aegean' },
      { id: 'K', name: 'Thessaly' },
      { id: 'L', name: 'West Greece' },
      { id: 'M', name: 'West Macedonia' }
    ]
  },
  {
    id: 'TR',
    name: 'Turquía',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    regions: [
      { id: 'IST', name: 'Istanbul' },
      { id: 'ANK', name: 'Ankara' },
      { id: 'IZM', name: 'Izmir' },
      { id: 'ANT', name: 'Antalya' },
      { id: 'BUR', name: 'Bursa' }
    ]
  },
  {
    id: 'JP',
    name: 'Japón',
    nameEn: 'Japan',
    flag: '🇯🇵',
    regions: [
      { id: 'TKY', name: 'Tokyo' },
      { id: 'OSA', name: 'Osaka' },
      { id: 'KTO', name: 'Kyoto' },
      { id: 'HKD', name: 'Hokkaido' },
      { id: 'FUK', name: 'Fukuoka' }
    ]
  },
  {
    id: 'CN',
    name: 'China',
    nameEn: 'China',
    flag: '🇨🇳',
    regions: [
      { id: 'BJ', name: 'Beijing' },
      { id: 'SH', name: 'Shanghai' },
      { id: 'GD', name: 'Guangdong' },
      { id: 'ZJ', name: 'Zhejiang' },
      { id: 'JS', name: 'Jiangsu' }
    ]
  },
  {
    id: 'IN',
    name: 'India',
    nameEn: 'India',
    flag: '🇮🇳',
    regions: [
      { id: 'MH', name: 'Maharashtra' },
      { id: 'DL', name: 'Delhi' },
      { id: 'KA', name: 'Karnataka' },
      { id: 'TN', name: 'Tamil Nadu' },
      { id: 'UP', name: 'Uttar Pradesh' }
    ]
  },
  {
    id: 'AU',
    name: 'Australia',
    nameEn: 'Australia',
    flag: '🇦🇺',
    regions: [
      { id: 'NSW', name: 'New South Wales' },
      { id: 'VIC', name: 'Victoria' },
      { id: 'QLD', name: 'Queensland' },
      { id: 'WA', name: 'Western Australia' },
      { id: 'SA', name: 'South Australia' },
      { id: 'TAS', name: 'Tasmania' },
      { id: 'ACT', name: 'Australian Capital Territory' },
      { id: 'NT', name: 'Northern Territory' }
    ]
  },
  {
    id: 'ZA',
    name: 'Sudáfrica',
    nameEn: 'South Africa',
    flag: '🇿🇦',
    regions: [
      { id: 'GP', name: 'Gauteng' },
      { id: 'WC', name: 'Western Cape' },
      { id: 'KZN', name: 'KwaZulu-Natal' },
      { id: 'EC', name: 'Eastern Cape' },
      { id: 'FS', name: 'Free State' },
      { id: 'LP', name: 'Limpopo' },
      { id: 'MP', name: 'Mpumalanga' },
      { id: 'NW', name: 'North West' },
      { id: 'NC', name: 'Northern Cape' }
    ]
  },
  {
    id: 'DO',
    name: 'República Dominicana',
    nameEn: 'Dominican Republic',
    flag: '🇩🇴',
    regions: [
      { id: 'DN', name: 'Distrito Nacional' },
      { id: 'SD', name: 'Santo Domingo' },
      { id: 'ST', name: 'Santiago' },
      { id: 'LA', name: 'La Altagracia' },
      { id: 'LR', name: 'La Romana' },
      { id: 'PP', name: 'Puerto Plata' }
    ]
  },
  {
    id: 'CR',
    name: 'Costa Rica',
    nameEn: 'Costa Rica',
    flag: '🇨🇷',
    regions: [
      { id: 'SJ', name: 'San José' },
      { id: 'AL', name: 'Alajuela' },
      { id: 'CA', name: 'Cartago' },
      { id: 'HE', name: 'Heredia' },
      { id: 'GU', name: 'Guanacaste' },
      { id: 'PU', name: 'Puntarenas' },
      { id: 'LI', name: 'Limón' }
    ]
  },
  {
    id: 'PA',
    name: 'Panamá',
    nameEn: 'Panama',
    flag: '🇵🇦',
    regions: [
      { id: 'PA', name: 'Panamá' },
      { id: 'PO', name: 'Panamá Oeste' },
      { id: 'CH', name: 'Chiriquí' },
      { id: 'VE', name: 'Veraguas' },
      { id: 'CO', name: 'Colón' }
    ]
  },
  {
    id: 'IE',
    name: 'Irlanda',
    nameEn: 'Ireland',
    flag: '🇮🇪',
    regions: [
      { id: 'DUB', name: 'Dublin' },
      { id: 'COR', name: 'Cork' },
      { id: 'GAL', name: 'Galway' },
      { id: 'LIM', name: 'Limerick' }
    ]
  },
  {
    id: 'PL',
    name: 'Polonia',
    nameEn: 'Poland',
    flag: '🇵🇱',
    regions: [
      { id: 'MA', name: 'Mazowieckie' },
      { id: 'MP', name: 'Małopolskie' },
      { id: 'SL', name: 'Śląskie' },
      { id: 'WP', name: 'Wielkopolskie' }
    ]
  },
  {
    id: 'RO',
    name: 'Rumanía',
    nameEn: 'Romania',
    flag: '🇷🇴',
    regions: [
      { id: 'B', name: 'București' },
      { id: 'CJ', name: 'Cluj' },
      { id: 'TM', name: 'Timiș' },
      { id: 'IS', name: 'Iași' }
    ]
  },
  {
    id: 'NO',
    name: 'Noruega',
    nameEn: 'Norway',
    flag: '🇳🇴',
    regions: [
      { id: 'OS', name: 'Oslo' },
      { id: 'VI', name: 'Viken' },
      { id: 'VE', name: 'Vestland' },
      { id: 'RO', name: 'Rogaland' }
    ]
  },
  {
    id: 'FI',
    name: 'Finlandia',
    nameEn: 'Finland',
    flag: '🇫🇮',
    regions: [
      { id: 'UU', name: 'Uusimaa' },
      { id: 'PI', name: 'Pirkanmaa' },
      { id: 'VS', name: 'Varsinais-Suomi' }
    ]
  },
  {
    id: 'DK',
    name: 'Dinamarca',
    nameEn: 'Denmark',
    flag: '🇩🇰',
    regions: [
      { id: 'HS', name: 'Hovedstaden' },
      { id: 'MJ', name: 'Midtjylland' },
      { id: 'SD', name: 'Syddanmark' }
    ]
  },
  {
    id: 'KR',
    name: 'Corea del Sur',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    regions: [
      { id: 'SE', name: 'Seoul' },
      { id: 'BU', name: 'Busan' },
      { id: 'IN', name: 'Incheon' }
    ]
  },
  {
    id: 'ID',
    name: 'Indonesia',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    regions: [
      { id: 'JK', name: 'Jakarta' },
      { id: 'JB', name: 'West Java' },
      { id: 'JT', name: 'Central Java' },
      { id: 'JI', name: 'East Java' }
    ]
  },
  {
    id: 'TH',
    name: 'Tailandia',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    regions: [
      { id: 'BK', name: 'Bangkok' },
      { id: 'CM', name: 'Chiang Mai' },
      { id: 'PK', name: 'Phuket' }
    ]
  },
  {
    id: 'VN',
    name: 'Vietnam',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    regions: [
      { id: 'HN', name: 'Hanoi' },
      { id: 'HCM', name: 'Ho Chi Minh City' }
    ]
  },
  {
    id: 'PH',
    name: 'Filipinas',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    regions: [
      { id: 'MNL', name: 'Metro Manila' },
      { id: 'CEB', name: 'Cebu' },
      { id: 'DAV', name: 'Davao' }
    ]
  },
  {
    id: 'IL',
    name: 'Israel',
    nameEn: 'Israel',
    flag: '🇮🇱',
    regions: [
      { id: 'TA', name: 'Tel Aviv' },
      { id: 'JM', name: 'Jerusalem' },
      { id: 'HA', name: 'Haifa' }
    ]
  },
  {
    id: 'SA',
    name: 'Arabia Saudita',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    regions: [
      { id: 'RI', name: 'Riyadh' },
      { id: 'MK', name: 'Makkah' },
      { id: 'EP', name: 'Eastern Province' }
    ]
  },
  {
    id: 'AE',
    name: 'EAU',
    nameEn: 'UAE',
    flag: '🇦🇪',
    regions: [
      { id: 'DU', name: 'Dubai' },
      { id: 'AB', name: 'Abu Dhabi' },
      { id: 'SH', name: 'Sharjah' }
    ]
  },
  {
    id: 'EG',
    name: 'Egipto',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    regions: [
      { id: 'CA', name: 'Cairo' },
      { id: 'AL', name: 'Alexandria' },
      { id: 'GI', name: 'Giza' }
    ]
  },
  {
    id: 'MA',
    name: 'Marruecos',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    regions: [
      { id: 'CS', name: 'Casablanca-Settat' },
      { id: 'RS', name: 'Rabat-Salé-Kénitra' },
      { id: 'MS', name: 'Marrakech-Safi' },
      { id: 'TF', name: 'Tanger-Tetouan-Al Hoceima' }
    ]
  },
  {
    id: 'NG',
    name: 'Nigeria',
    nameEn: 'Nigeria',
    flag: '🇳🇬',
    regions: [
      { id: 'LA', name: 'Lagos' },
      { id: 'AB', name: 'Abuja' },
      { id: 'KA', name: 'Kano' }
    ]
  },
  {
    id: 'KE',
    name: 'Kenia',
    nameEn: 'Kenya',
    flag: '🇰🇪',
    regions: [
      { id: 'NA', name: 'Nairobi' },
      { id: 'MO', name: 'Mombasa' },
      { id: 'KI', name: 'Kisumu' }
    ]
  },
  {
    id: 'NZ',
    name: 'Nueva Zelanda',
    nameEn: 'New Zealand',
    flag: '🇳🇿',
    regions: [
      { id: 'AK', name: 'Auckland' },
      { id: 'WE', name: 'Wellington' },
      { id: 'CA', name: 'Canterbury' }
    ]
  },
  {
    id: 'CU',
    name: 'Cuba',
    nameEn: 'Cuba',
    flag: '🇨🇺',
    regions: [
      { id: 'CH', name: 'La Habana' },
      { id: 'SC', name: 'Santiago de Cuba' },
      { id: 'VC', name: 'Villa Clara' },
      { id: 'HO', name: 'Holguín' }
    ]
  },
  {
    id: 'SV',
    name: 'El Salvador',
    nameEn: 'El Salvador',
    flag: '🇸🇻',
    regions: [
      { id: 'SS', name: 'San Salvador' },
      { id: 'SA', name: 'Santa Ana' },
      { id: 'SM', name: 'San Miguel' },
      { id: 'LL', name: 'La Libertad' }
    ]
  },
  {
    id: 'HN',
    name: 'Honduras',
    nameEn: 'Honduras',
    flag: '🇭🇳',
    regions: [
      { id: 'FM', name: 'Francisco Morazán' },
      { id: 'CO', name: 'Cortés' },
      { id: 'AT', name: 'Atlántida' },
      { id: 'CH', name: 'Choluteca' }
    ]
  },
  {
    id: 'NI',
    name: 'Nicaragua',
    nameEn: 'Nicaragua',
    flag: '🇳🇮',
    regions: [
      { id: 'MA', name: 'Managua' },
      { id: 'LE', name: 'León' },
      { id: 'GR', name: 'Granada' },
      { id: 'CH', name: 'Chinandega' }
    ]
  },
  {
    id: 'PR',
    name: 'Puerto Rico',
    nameEn: 'Puerto Rico',
    flag: '🇵🇷',
    regions: [
      { id: 'SJ', name: 'San Juan' },
      { id: 'BA', name: 'Bayamón' },
      { id: 'CA', name: 'Carolina' },
      { id: 'PO', name: 'Ponce' }
    ]
  },
  {
    id: 'JM',
    name: 'Jamaica',
    nameEn: 'Jamaica',
    flag: '🇯🇲',
    regions: [
      { id: 'KI', name: 'Kingston' },
      { id: 'SA', name: 'Saint Andrew' },
      { id: 'ST', name: 'Saint Catherine' },
      { id: 'ST', name: 'Saint James' }
    ]
  },
  {
    id: 'TT',
    name: 'Trinidad y Tobago',
    nameEn: 'Trinidad and Tobago',
    flag: '🇹🇹',
    regions: [
      { id: 'PO', name: 'Port of Spain' },
      { id: 'CH', name: 'Chaguanas' },
      { id: 'SA', name: 'San Fernando' }
    ]
  },
  {
    id: 'BS',
    name: 'Bahamas',
    nameEn: 'Bahamas',
    flag: '🇧🇸',
    regions: [
      { id: 'NP', name: 'New Providence' },
      { id: 'GB', name: 'Grand Bahama' }
    ]
  },
  {
    id: 'BB',
    name: 'Barbados',
    nameEn: 'Barbados',
    flag: '🇧🇧',
    regions: [
      { id: 'SM', name: 'Saint Michael' },
      { id: 'SC', name: 'Saint Christ Church' }
    ]
  },
  {
    id: 'GY',
    name: 'Guyana',
    nameEn: 'Guyana',
    flag: '🇬🇾',
    regions: [
      { id: 'DE', name: 'Demerara-Mahaica' },
      { id: 'BE', name: 'Berbice' }
    ]
  },
  {
    id: 'SR',
    name: 'Surinam',
    nameEn: 'Suriname',
    flag: '🇸🇷',
    regions: [
      { id: 'PA', name: 'Paramaribo' },
      { id: 'WA', name: 'Wanica' }
    ]
  },
  {
    id: 'BZ',
    name: 'Belice',
    nameEn: 'Belize',
    flag: '🇧🇿',
    regions: [
      { id: 'BZ', name: 'Belize' },
      { id: 'CA', name: 'Cayo' }
    ]
  },
  {
    id: 'HT',
    name: 'Haití',
    nameEn: 'Haiti',
    flag: '🇭🇹',
    regions: [
      { id: 'OU', name: 'Ouest' },
      { id: 'NO', name: 'Nord' }
    ]
  },
  {
    id: 'IS',
    name: 'Islandia',
    nameEn: 'Iceland',
    flag: '🇮🇸',
    regions: [
      { id: 'HO', name: 'Höfuðborgarsvæði' },
      { id: 'SU', name: 'Suðurnes' }
    ]
  },
  {
    id: 'LU',
    name: 'Luxemburgo',
    nameEn: 'Luxembourg',
    flag: '🇱🇺',
    regions: [
      { id: 'LU', name: 'Luxembourg' },
      { id: 'DI', name: 'Diekirch' }
    ]
  },
  {
    id: 'MC',
    name: 'Mónaco',
    nameEn: 'Monaco',
    flag: '🇲🇨',
    regions: [
      { id: 'MO', name: 'Monte Carlo' },
      { id: 'LA', name: 'La Condamine' }
    ]
  },
  {
    id: 'MT',
    name: 'Malta',
    nameEn: 'Malta',
    flag: '🇲🇹',
    regions: [
      { id: 'VA', name: 'Valletta' },
      { id: 'SL', name: 'Sliema' }
    ]
  },
  {
    id: 'CY',
    name: 'Chipre',
    nameEn: 'Cyprus',
    flag: '🇨🇾',
    regions: [
      { id: 'NI', name: 'Nicosia' },
      { id: 'LI', name: 'Limassol' }
    ]
  },
  {
    id: 'CZ',
    name: 'República Checa',
    nameEn: 'Czech Republic',
    flag: '🇨🇿',
    regions: [
      { id: 'PR', name: 'Praha' },
      { id: 'BM', name: 'Brno' },
      { id: 'OS', name: 'Ostrava' }
    ]
  },
  {
    id: 'SK',
    name: 'Eslovaquia',
    nameEn: 'Slovakia',
    flag: '🇸🇰',
    regions: [
      { id: 'BR', name: 'Bratislava' },
      { id: 'KO', name: 'Košice' }
    ]
  },
  {
    id: 'HU',
    name: 'Hungría',
    nameEn: 'Hungary',
    flag: '🇭🇺',
    regions: [
      { id: 'BU', name: 'Budapest' },
      { id: 'DE', name: 'Debrecen' }
    ]
  },
  {
    id: 'BG',
    name: 'Bulgaria',
    nameEn: 'Bulgaria',
    flag: '🇧🇬',
    regions: [
      { id: 'SO', name: 'Sofia' },
      { id: 'PL', name: 'Plovdiv' }
    ]
  },
  {
    id: 'HR',
    name: 'Croacia',
    nameEn: 'Croatia',
    flag: '🇭🇷',
    regions: [
      { id: 'ZA', name: 'Zagreb' },
      { id: 'SP', name: 'Split' }
    ]
  },
  {
    id: 'SI',
    name: 'Eslovenia',
    nameEn: 'Slovenia',
    flag: '🇸🇮',
    regions: [
      { id: 'LJ', name: 'Ljubljana' },
      { id: 'MA', name: 'Maribor' }
    ]
  },
  {
    id: 'RS',
    name: 'Serbia',
    nameEn: 'Serbia',
    flag: '🇷🇸',
    regions: [
      { id: 'BE', name: 'Belgrade' },
      { id: 'NS', name: 'Novi Sad' }
    ]
  },
  {
    id: 'BA',
    name: 'Bosnia y Herzegovina',
    nameEn: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    regions: [
      { id: 'SA', name: 'Sarajevo' },
      { id: 'BL', name: 'Banja Luka' }
    ]
  },
  {
    id: 'ME',
    name: 'Montenegro',
    nameEn: 'Montenegro',
    flag: '🇲🇪',
    regions: [
      { id: 'PO', name: 'Podgorica' },
      { id: 'NI', name: 'Nikšić' }
    ]
  },
  {
    id: 'AL',
    name: 'Albania',
    nameEn: 'Albania',
    flag: '🇦🇱',
    regions: [
      { id: 'TI', name: 'Tirana' },
      { id: 'DU', name: 'Durrës' }
    ]
  },
  {
    id: 'MK',
    name: 'Macedonia del Norte',
    nameEn: 'North Macedonia',
    flag: '🇲🇰',
    regions: [
      { id: 'SK', name: 'Skopje' },
      { id: 'BI', name: 'Bitola' }
    ]
  },
  {
    id: 'EE',
    name: 'Estonia',
    nameEn: 'Estonia',
    flag: '🇪🇪',
    regions: [
      { id: 'TA', name: 'Tallinn' },
      { id: 'TU', name: 'Tartu' }
    ]
  },
  {
    id: 'LV',
    name: 'Letonia',
    nameEn: 'Latvia',
    flag: '🇱🇻',
    regions: [
      { id: 'RI', name: 'Riga' },
      { id: 'DA', name: 'Daugavpils' }
    ]
  },
  {
    id: 'LT',
    name: 'Lituania',
    nameEn: 'Lithuania',
    flag: '🇱🇹',
    regions: [
      { id: 'VI', name: 'Vilnius' },
      { id: 'KA', name: 'Kaunas' }
    ]
  },
  {
    id: 'UA',
    name: 'Ucrania',
    nameEn: 'Ukraine',
    flag: '🇺🇦',
    regions: [
      { id: 'KY', name: 'Kyiv' },
      { id: 'KH', name: 'Kharkiv' },
      { id: 'OD', name: 'Odesa' }
    ]
  },
  {
    id: 'BY',
    name: 'Bielorrusia',
    nameEn: 'Belarus',
    flag: '🇧🇾',
    regions: [
      { id: 'MI', name: 'Minsk' },
      { id: 'GO', name: 'Gomel' }
    ]
  },
  {
    id: 'MD',
    name: 'Moldavia',
    nameEn: 'Moldova',
    flag: '🇲🇩',
    regions: [
      { id: 'CH', name: 'Chișinău' },
      { id: 'BA', name: 'Bălți' }
    ]
  },
  {
    id: 'GE',
    name: 'Georgia',
    nameEn: 'Georgia',
    flag: '🇬🇪',
    regions: [
      { id: 'TB', name: 'Tbilisi' },
      { id: 'BA', name: 'Batumi' }
    ]
  },
  {
    id: 'AM',
    name: 'Armenia',
    nameEn: 'Armenia',
    flag: '🇦🇲',
    regions: [
      { id: 'YE', name: 'Yerevan' },
      { id: 'GY', name: 'Gyumri' }
    ]
  },
  {
    id: 'AZ',
    name: 'Azerbaiyán',
    nameEn: 'Azerbaijan',
    flag: '🇦🇿',
    regions: [
      { id: 'BA', name: 'Baku' },
      { id: 'GA', name: 'Ganja' }
    ]
  },
  {
    id: 'KZ',
    name: 'Kazajistán',
    nameEn: 'Kazakhstan',
    flag: '🇰🇿',
    regions: [
      { id: 'AL', name: 'Almaty' },
      { id: 'AS', name: 'Astana' }
    ]
  },
  {
    id: 'UZ',
    name: 'Uzbekistán',
    nameEn: 'Uzbekistan',
    flag: '🇺🇿',
    regions: [
      { id: 'TA', name: 'Tashkent' },
      { id: 'SA', name: 'Samarkand' }
    ]
  },
  {
    id: 'PK',
    name: 'Pakistán',
    nameEn: 'Pakistan',
    flag: '🇵🇰',
    regions: [
      { id: 'KA', name: 'Karachi' },
      { id: 'LA', name: 'Lahore' },
      { id: 'IS', name: 'Islamabad' }
    ]
  },
  {
    id: 'BD',
    name: 'Bangladesh',
    nameEn: 'Bangladesh',
    flag: '🇧🇩',
    regions: [
      { id: 'DH', name: 'Dhaka' },
      { id: 'CH', name: 'Chattogram' }
    ]
  },
  {
    id: 'LK',
    name: 'Sri Lanka',
    nameEn: 'Sri Lanka',
    flag: '🇱🇰',
    regions: [
      { id: 'CO', name: 'Colombo' },
      { id: 'KA', name: 'Kandy' }
    ]
  },
  {
    id: 'NP',
    name: 'Nepal',
    nameEn: 'Nepal',
    flag: '🇳🇵',
    regions: [
      { id: 'KA', name: 'Kathmandu' },
      { id: 'PO', name: 'Pokhara' }
    ]
  },
  {
    id: 'SG',
    name: 'Singapur',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    regions: [
      { id: 'SG', name: 'Singapore' }
    ]
  },
  {
    id: 'MY',
    name: 'Malasia',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    regions: [
      { id: 'KL', name: 'Kuala Lumpur' },
      { id: 'PE', name: 'Penang' },
      { id: 'JO', name: 'Johor' }
    ]
  },
  {
    id: 'AF',
    name: 'Afganistán',
    nameEn: 'Afghanistan',
    flag: '🇦🇫',
    regions: [{ id: 'KA', name: 'Kabul' }]
  },
  {
    id: 'DZ',
    name: 'Argelia',
    nameEn: 'Algeria',
    flag: '🇩🇿',
    regions: [{ id: 'AL', name: 'Algiers' }]
  },
  {
    id: 'AO',
    name: 'Angola',
    nameEn: 'Angola',
    flag: '🇦🇴',
    regions: [{ id: 'LU', name: 'Luanda' }]
  },
  {
    id: 'AG',
    name: 'Antigua y Barbuda',
    nameEn: 'Antigua and Barbuda',
    flag: '🇦🇬',
    regions: [{ id: 'ST', name: 'Saint John\'s' }]
  },
  {
    id: 'BH',
    name: 'Baréin',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    regions: [{ id: 'MA', name: 'Manama' }]
  },
  {
    id: 'BJ',
    name: 'Benín',
    nameEn: 'Benin',
    flag: '🇧🇯',
    regions: [{ id: 'PO', name: 'Porto-Novo' }]
  },
  {
    id: 'BT',
    name: 'Bután',
    nameEn: 'Bhutan',
    flag: '🇧🇹',
    regions: [{ id: 'TH', name: 'Thimphu' }]
  },
  {
    id: 'BW',
    name: 'Botsuana',
    nameEn: 'Botswana',
    flag: '🇧🇼',
    regions: [{ id: 'GA', name: 'Gaborone' }]
  },
  {
    id: 'BN',
    name: 'Brunéi',
    nameEn: 'Brunei',
    flag: '🇧🇳',
    regions: [{ id: 'BS', name: 'Bandar Seri Begawan' }]
  },
  {
    id: 'BF',
    name: 'Burkina Faso',
    nameEn: 'Burkina Faso',
    flag: '🇧🇫',
    regions: [{ id: 'OU', name: 'Ouagadougou' }]
  },
  {
    id: 'BI',
    name: 'Burundi',
    nameEn: 'Burundi',
    flag: '🇧🇮',
    regions: [{ id: 'BU', name: 'Bujumbura' }]
  },
  {
    id: 'KH',
    name: 'Camboya',
    nameEn: 'Cambodia',
    flag: '🇰🇭',
    regions: [{ id: 'PH', name: 'Phnom Penh' }]
  },
  {
    id: 'CM',
    name: 'Camerún',
    nameEn: 'Cameroon',
    flag: '🇨🇲',
    regions: [{ id: 'YA', name: 'Yaoundé' }]
  },
  {
    id: 'CV',
    name: 'Cabo Verde',
    nameEn: 'Cape Verde',
    flag: '🇨🇻',
    regions: [{ id: 'PR', name: 'Praia' }]
  },
  {
    id: 'CF',
    name: 'República Centroafricana',
    nameEn: 'Central African Republic',
    flag: '🇨🇫',
    regions: [{ id: 'BA', name: 'Bangui' }]
  },
  {
    id: 'TD',
    name: 'Chad',
    nameEn: 'Chad',
    flag: '🇹🇩',
    regions: [{ id: 'ND', name: 'N\'Djamena' }]
  },
  {
    id: 'KM',
    name: 'Comoras',
    nameEn: 'Comoros',
    flag: '🇰🇲',
    regions: [{ id: 'MO', name: 'Moroni' }]
  },
  {
    id: 'CG',
    name: 'Congo',
    nameEn: 'Congo',
    flag: '🇨🇬',
    regions: [{ id: 'BR', name: 'Brazzaville' }]
  },
  {
    id: 'CD',
    name: 'Congo (Rep. Dem.)',
    nameEn: 'Congo (Dem. Rep.)',
    flag: '🇨🇩',
    regions: [{ id: 'KI', name: 'Kinshasa' }]
  },
  {
    id: 'CI',
    name: 'Costa de Marfil',
    nameEn: 'Ivory Coast',
    flag: '🇨🇮',
    regions: [{ id: 'YA', name: 'Yamoussoukro' }]
  },
  {
    id: 'DJ',
    name: 'Yibuti',
    nameEn: 'Djibouti',
    flag: '🇩🇯',
    regions: [{ id: 'DJ', name: 'Djibouti' }]
  },
  {
    id: 'DM',
    name: 'Dominica',
    nameEn: 'Dominica',
    flag: '🇩🇲',
    regions: [{ id: 'RO', name: 'Roseau' }]
  },
  {
    id: 'GQ',
    name: 'Guinea Ecuatorial',
    nameEn: 'Equatorial Guinea',
    flag: '🇬🇶',
    regions: [{ id: 'MA', name: 'Malabo' }]
  },
  {
    id: 'ER',
    name: 'Eritrea',
    nameEn: 'Eritrea',
    flag: '🇪🇷',
    regions: [{ id: 'AS', name: 'Asmara' }]
  },
  {
    id: 'ET',
    name: 'Etiopía',
    nameEn: 'Ethiopia',
    flag: '🇪🇹',
    regions: [{ id: 'AD', name: 'Addis Ababa' }]
  },
  {
    id: 'FJ',
    name: 'Fiyi',
    nameEn: 'Fiji',
    flag: '🇫🇯',
    regions: [{ id: 'SU', name: 'Suva' }]
  },
  {
    id: 'GA',
    name: 'Gabón',
    nameEn: 'Gabon',
    flag: '🇬🇦',
    regions: [{ id: 'LI', name: 'Libreville' }]
  },
  {
    id: 'GM',
    name: 'Gambia',
    nameEn: 'Gambia',
    flag: '🇬🇲',
    regions: [{ id: 'BA', name: 'Banjul' }]
  },
  {
    id: 'GH',
    name: 'Ghana',
    nameEn: 'Ghana',
    flag: '🇬🇭',
    regions: [{ id: 'AC', name: 'Accra' }]
  },
  {
    id: 'GD',
    name: 'Granada',
    nameEn: 'Grenada',
    flag: '🇬🇩',
    regions: [{ id: 'ST', name: 'Saint George\'s' }]
  },
  {
    id: 'GN',
    name: 'Guinea',
    nameEn: 'Guinea',
    flag: '🇬🇳',
    regions: [{ id: 'CO', name: 'Conakry' }]
  },
  {
    id: 'GW',
    name: 'Guinea-Bisáu',
    nameEn: 'Guinea-Bissau',
    flag: '🇬🇼',
    regions: [{ id: 'BI', name: 'Bissau' }]
  },
  {
    id: 'IQ',
    name: 'Irak',
    nameEn: 'Iraq',
    flag: '🇮🇶',
    regions: [{ id: 'BA', name: 'Baghdad' }]
  },
  {
    id: 'JO',
    name: 'Jordania',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    regions: [{ id: 'AM', name: 'Amman' }]
  },
  {
    id: 'KW',
    name: 'Kuwait',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    regions: [{ id: 'KU', name: 'Kuwait City' }]
  },
  {
    id: 'KG',
    name: 'Kirguistán',
    nameEn: 'Kyrgyzstan',
    flag: '🇰🇬',
    regions: [{ id: 'BI', name: 'Bishkek' }]
  },
  {
    id: 'LA',
    name: 'Laos',
    nameEn: 'Laos',
    flag: '🇱🇦',
    regions: [{ id: 'VI', name: 'Vientiane' }]
  },
  {
    id: 'LB',
    name: 'Líbano',
    nameEn: 'Lebanon',
    flag: '🇱🇧',
    regions: [{ id: 'BE', name: 'Beirut' }]
  },
  {
    id: 'LS',
    name: 'Lesoto',
    nameEn: 'Lesotho',
    flag: '🇱🇸',
    regions: [{ id: 'MA', name: 'Maseru' }]
  },
  {
    id: 'LR',
    name: 'Liberia',
    nameEn: 'Liberia',
    flag: '🇱🇷',
    regions: [{ id: 'MO', name: 'Monrovia' }]
  },
  {
    id: 'LY',
    name: 'Libia',
    nameEn: 'Libya',
    flag: '🇱🇾',
    regions: [{ id: 'TR', name: 'Tripoli' }]
  },
  {
    id: 'LI',
    name: 'Liechtenstein',
    nameEn: 'Liechtenstein',
    flag: '🇱🇮',
    regions: [{ id: 'VA', name: 'Vaduz' }]
  },
  {
    id: 'MG',
    name: 'Madagascar',
    nameEn: 'Madagascar',
    flag: '🇲🇬',
    regions: [{ id: 'AN', name: 'Antananarivo' }]
  },
  {
    id: 'MW',
    name: 'Malaui',
    nameEn: 'Malawi',
    flag: '🇲🇼',
    regions: [{ id: 'LI', name: 'Lilongwe' }]
  },
  {
    id: 'MV',
    name: 'Maldivas',
    nameEn: 'Maldives',
    flag: '🇲🇻',
    regions: [{ id: 'MA', name: 'Malé' }]
  },
  {
    id: 'ML',
    name: 'Mali',
    nameEn: 'Mali',
    flag: '🇲🇱',
    regions: [{ id: 'BA', name: 'Bamako' }]
  },
  {
    id: 'MH',
    name: 'Islas Marshall',
    nameEn: 'Marshall Islands',
    flag: '🇲🇭',
    regions: [{ id: 'MA', name: 'Majuro' }]
  },
  {
    id: 'MR',
    name: 'Mauritania',
    nameEn: 'Mauritania',
    flag: '🇲🇷',
    regions: [{ id: 'NO', name: 'Nouakchott' }]
  },
  {
    id: 'MU',
    name: 'Mauricio',
    nameEn: 'Mauritius',
    flag: '🇲🇺',
    regions: [{ id: 'PO', name: 'Port Louis' }]
  },
  {
    id: 'FM',
    name: 'Micronesia',
    nameEn: 'Micronesia',
    flag: '🇫🇲',
    regions: [{ id: 'PA', name: 'Palikir' }]
  },
  {
    id: 'MN',
    name: 'Mongolia',
    nameEn: 'Mongolia',
    flag: '🇲🇳',
    regions: [{ id: 'UL', name: 'Ulaanbaatar' }]
  },
  {
    id: 'MZ',
    name: 'Mozambique',
    nameEn: 'Mozambique',
    flag: '🇲🇿',
    regions: [{ id: 'MA', name: 'Maputo' }]
  },
  {
    id: 'MM',
    name: 'Birmania',
    nameEn: 'Myanmar',
    flag: '🇲🇲',
    regions: [{ id: 'NA', name: 'Naypyidaw' }]
  },
  {
    id: 'NA',
    name: 'Namibia',
    nameEn: 'Namibia',
    flag: '🇳🇦',
    regions: [{ id: 'WI', name: 'Windhoek' }]
  },
  {
    id: 'NR',
    name: 'Nauru',
    nameEn: 'Nauru',
    flag: '🇳🇷',
    regions: [{ id: 'YA', name: 'Yaren' }]
  },
  {
    id: 'NE',
    name: 'Níger',
    nameEn: 'Niger',
    flag: '🇳🇪',
    regions: [{ id: 'NI', name: 'Niamey' }]
  },
  {
    id: 'OM',
    name: 'Omán',
    nameEn: 'Oman',
    flag: '🇴🇲',
    regions: [{ id: 'MU', name: 'Muscat' }]
  },
  {
    id: 'PW',
    name: 'Palaos',
    nameEn: 'Palau',
    flag: '🇵🇼',
    regions: [{ id: 'NG', name: 'Ngerulmud' }]
  },
  {
    id: 'PG',
    name: 'Papúa Nueva Guinea',
    nameEn: 'Papua New Guinea',
    flag: '🇵🇬',
    regions: [{ id: 'PO', name: 'Port Moresby' }]
  },
  {
    id: 'QA',
    name: 'Catar',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    regions: [{ id: 'DO', name: 'Doha' }]
  },
  {
    id: 'RW',
    name: 'Ruanda',
    nameEn: 'Rwanda',
    flag: '🇷🇼',
    regions: [{ id: 'KI', name: 'Kigali' }]
  },
  {
    id: 'KN',
    name: 'San Cristóbal y Nieves',
    nameEn: 'Saint Kitts and Nevis',
    flag: '🇰🇳',
    regions: [{ id: 'BA', name: 'Basseterre' }]
  },
  {
    id: 'LC',
    name: 'Santa Lucía',
    nameEn: 'Saint Lucia',
    flag: '🇱🇨',
    regions: [{ id: 'CA', name: 'Castries' }]
  },
  {
    id: 'VC',
    name: 'San Vicente y las Granadinas',
    nameEn: 'Saint Vincent and the Grenadines',
    flag: '🇻🇨',
    regions: [{ id: 'KI', name: 'Kingstown' }]
  },
  {
    id: 'WS',
    name: 'Samoa',
    nameEn: 'Samoa',
    flag: '🇼🇸',
    regions: [{ id: 'AP', name: 'Apia' }]
  },
  {
    id: 'SM',
    name: 'San Marino',
    nameEn: 'San Marino',
    flag: '🇸🇲',
    regions: [{ id: 'SA', name: 'San Marino' }]
  },
  {
    id: 'ST',
    name: 'Santo Tomé y Príncipe',
    nameEn: 'Sao Tome and Principe',
    flag: '🇸🇹',
    regions: [{ id: 'SA', name: 'São Tomé' }]
  },
  {
    id: 'SN',
    name: 'Senegal',
    nameEn: 'Senegal',
    flag: '🇸🇳',
    regions: [{ id: 'DA', name: 'Dakar' }]
  },
  {
    id: 'SC',
    name: 'Seychelles',
    nameEn: 'Seychelles',
    flag: '🇸🇨',
    regions: [{ id: 'VI', name: 'Victoria' }]
  },
  {
    id: 'SL',
    name: 'Sierra Leona',
    nameEn: 'Sierra Leone',
    flag: '🇸🇱',
    regions: [{ id: 'FR', name: 'Freetown' }]
  },
  {
    id: 'SB',
    name: 'Islas Salomón',
    nameEn: 'Solomon Islands',
    flag: '🇸🇧',
    regions: [{ id: 'HO', name: 'Honiara' }]
  },
  {
    id: 'SO',
    name: 'Somalia',
    nameEn: 'Somalia',
    flag: '🇸🇴',
    regions: [{ id: 'MO', name: 'Mogadishu' }]
  },
  {
    id: 'SS',
    name: 'Sudán del Sur',
    nameEn: 'South Sudan',
    flag: '🇸🇸',
    regions: [{ id: 'JU', name: 'Juba' }]
  },
  {
    id: 'SD',
    name: 'Sudán',
    nameEn: 'Sudan',
    flag: '🇸🇩',
    regions: [{ id: 'KH', name: 'Khartoum' }]
  },
  {
    id: 'SY',
    name: 'Siria',
    nameEn: 'Syria',
    flag: '🇸🇾',
    regions: [{ id: 'DA', name: 'Damascus' }]
  },
  {
    id: 'TJ',
    name: 'Tayikistán',
    nameEn: 'Tajikistan',
    flag: '🇹🇯',
    regions: [{ id: 'DU', name: 'Dushanbe' }]
  },
  {
    id: 'TZ',
    name: 'Tanzania',
    nameEn: 'Tanzania',
    flag: '🇹🇿',
    regions: [{ id: 'DO', name: 'Dodoma' }]
  },
  {
    id: 'TL',
    name: 'Timor Oriental',
    nameEn: 'Timor-Leste',
    flag: '🇹🇱',
    regions: [{ id: 'DI', name: 'Dili' }]
  },
  {
    id: 'TG',
    name: 'Togo',
    nameEn: 'Togo',
    flag: '🇹🇬',
    regions: [{ id: 'LO', name: 'Lomé' }]
  },
  {
    id: 'TO',
    name: 'Tonga',
    nameEn: 'Tonga',
    flag: '🇹🇴',
    regions: [{ id: 'NU', name: 'Nuku\'alofa' }]
  },
  {
    id: 'TN',
    name: 'Túnez',
    nameEn: 'Tunisia',
    flag: '🇹🇳',
    regions: [{ id: 'TU', name: 'Tunis' }]
  },
  {
    id: 'TM',
    name: 'Turkmenistán',
    nameEn: 'Turkmenistan',
    flag: '🇹🇲',
    regions: [{ id: 'AS', name: 'Ashgabat' }]
  },
  {
    id: 'TV',
    name: 'Tuvalu',
    nameEn: 'Tuvalu',
    flag: '🇹🇻',
    regions: [{ id: 'FU', name: 'Funafuti' }]
  },
  {
    id: 'UG',
    name: 'Uganda',
    nameEn: 'Uganda',
    flag: '🇺🇬',
    regions: [{ id: 'KA', name: 'Kampala' }]
  },
  {
    id: 'VU',
    name: 'Vanuatu',
    nameEn: 'Vanuatu',
    flag: '🇻🇺',
    regions: [{ id: 'PO', name: 'Port Vila' }]
  },
  {
    id: 'YE',
    name: 'Yemen',
    nameEn: 'Yemen',
    flag: '🇾🇪',
    regions: [{ id: 'SA', name: 'Sana\'a' }]
  },
  {
    id: 'ZM',
    name: 'Zambia',
    nameEn: 'Zambia',
    flag: '🇿🇲',
    regions: [{ id: 'LU', name: 'Lusaka' }]
  },
  {
    id: 'ZW',
    name: 'Zimbabue',
    nameEn: 'Zimbabwe',
    flag: '🇿🇼',
    regions: [{ id: 'HA', name: 'Harare' }]
  },
  {
    id: 'OT',
    name: 'Otro / Other',
    nameEn: 'Other',
    flag: '🌍',
    regions: [
      { id: 'OT', name: 'Otro / Other' }
    ]
  }
];
