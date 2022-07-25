"use strict";var slide_hero=new Swiper(".slide-hero",{effect:"fade",pagination:{el:".slide-hero .main-area .area-explore .swiper-pagination"}}),cardPokemon=document.querySelectorAll(".js-open-details-pokemon"),btnCloseModal=document.querySelector(".js-close-modal-details-pokemon"),countPokemons=document.getElementById("js-count-pokemons"),btnDropdownSelect=(cardPokemon.forEach(function(e){e.addEventListener("click",openDetailsPokemon)}),btnCloseModal&&btnCloseModal.addEventListener("click",closeDetailsPokemon),document.querySelector(".js-open-select-custom")),areaPokemons=(btnDropdownSelect.addEventListener("click",function(){btnDropdownSelect.parentElement.classList.toggle("active")}),document.getElementById("js-list-pokemons"));function primeiraLetraMaiuscula(e){return e.charAt(0).toUpperCase()+e.slice(1)}function createCardPokemon(e,t,n,o){var a=document.createElement("button"),c=(a.classList="card-pokemon js-open-details-pokemon ".concat(t),a.setAttribute("code-pokemon",e),areaPokemons.appendChild(a),document.createElement("div")),s=(c.classList="image",a.appendChild(c),document.createElement("img")),o=(s.className="thumb-img",s.setAttribute("src",o),c.appendChild(s),document.createElement("div")),c=(o.classList="info",a.appendChild(o),document.createElement("div")),s=(c.classList="text",o.appendChild(c),document.createElement("span")),a=(s.textContent=(e<10?"#00":e<100?"#0":"#").concat(e),c.appendChild(s),document.createElement("h3")),e=(a.textContent=primeiraLetraMaiuscula(n),c.appendChild(a),document.createElement("div")),s=(e.classList="icon",o.appendChild(e),document.createElement("img"));s.setAttribute("src","src/img/icon-types/".concat(t,".svg")),e.appendChild(s)}function listingPokemons(e){axios({method:"GET",url:e}).then(function(e){var e=e.data,t=e.results,e=(e.next,e.count);countPokemons.innerText=e,t.forEach(function(e){e=e.url;axios({method:"GET",url:"".concat(e)}).then(function(e){var e=e.data,t=e.name,n=e.id,o=e.sprites,e=e.types,t={nome:t,code:n,imagePok:o.other.dream_world.front_default,type:e[0].type.name};createCardPokemon(t.code,t.type,t.nome,t.imagePok),document.querySelectorAll(".js-open-details-pokemon").forEach(function(e){e.addEventListener("click",openDetailsPokemon)})})})})}function openDetailsPokemon(){document.documentElement.classList.add("open-modal");var e=this.getAttribute("code-pokemon"),t=this.querySelector(".thumb-img"),n=this.querySelector(".info .icon img"),o=this.querySelector(".info h3"),a=this.querySelector(".info span"),c=document.getElementById("js-modal-details"),s=document.getElementById("js-image-pokemon-modal"),i=document.getElementById("js-image-type-modal"),m=document.getElementById("js-name-pokemon-modal"),d=document.getElementById("js-code-pokemon-modal"),l=document.getElementById("js-height-pokemon"),r=document.getElementById("js-weight-pokemon"),p=document.getElementById("js-main-abilities-pokemon");s.setAttribute("src",t.getAttribute("src")),c.setAttribute("type-pokemon-modal",this.classList[2]),i.setAttribute("src",n.getAttribute("src")),m.textContent=o.textContent,d.textContent=a.textContent,axios({method:"GET",url:"https://pokeapi.co/api/v2/pokemon/".concat(e)}).then(function(e){var o,a,e=e.data,e={mainAbilities:primeiraLetraMaiuscula(e.abilities[0].ability.name),types:e.types,weight:e.weight,height:e.height,abilities:e.abilities,stats:e.stats,urlType:e.types[0].type.url};l.textContent="".concat(e.height/10,"m"),r.textContent="".concat(e.weight/10,"Kg"),p.textContent=e.mainAbilities,document.getElementById("js-stats-hp").style.width="".concat(e.stats[0].base_stat,"%"),document.getElementById("js-stats-attack").style.width="".concat(e.stats[1].base_stat,"%"),document.getElementById("js-stats-defense").style.width="".concat(e.stats[2].base_stat,"%"),document.getElementById("js-stats-sp-attack").style.width="".concat(e.stats[3].base_stat,"%"),document.getElementById("js-stats-sp-defense").style.width="".concat(e.stats[4].base_stat,"%"),document.getElementById("js-stats-speed").style.width="".concat(e.stats[5].base_stat,"%"),(o=document.getElementById("js-types-pokemon")).innerHTML="",e.types.forEach(function(e){var t=document.createElement("li"),n=(o.appendChild(t),document.createElement("span"));n.classList="tag-type ".concat(e.type.name),n.textContent=primeiraLetraMaiuscula(e.type.name),t.appendChild(n)}),(a=document.getElementById("js-area-weak")).innerHTML="",axios({method:"GET",url:"".concat(e.urlType)}).then(function(e){e.data.damage_relations.double_damage_from.forEach(function(e){var t=document.createElement("li"),n=(a.appendChild(t),document.createElement("span"));n.classList="tag-type ".concat(e.name),n.textContent=primeiraLetraMaiuscula(e.name),t.appendChild(n)})})})}function closeDetailsPokemon(){document.documentElement.classList.remove("open-modal")}listingPokemons("https://pokeapi.co/api/v2/pokemon?limit=9&offset=0");var areaTypes=document.getElementById("js-type-area"),areaTypesMobile=document.querySelector(".dropdown-select"),btnLoadMore=(axios({method:"GET",url:"https://pokeapi.co/api/v2/type"}).then(function(e){e.data.results.forEach(function(e,t){var n,o,a;t<18&&(o=document.createElement("li"),areaTypes.appendChild(o),(n=document.createElement("button")).classList="type-filter ".concat(e.name),n.setAttribute("code-type",t+1),o.appendChild(n),(o=document.createElement("div")).classList="icon",n.appendChild(o),(a=document.createElement("img")).setAttribute("src","src/img/icon-types/".concat(e.name,".svg")),o.appendChild(a),(o=document.createElement("span")).textContent=primeiraLetraMaiuscula(e.name),n.appendChild(o),a=document.createElement("li"),areaTypesMobile.appendChild(a),(n=document.createElement("button")).classList="type-filter ".concat(e.name),n.setAttribute("code-type",t+1),a.appendChild(n),(o=document.createElement("div")).classList="icon",n.appendChild(o),(t=document.createElement("img")).setAttribute("src","src/img/icon-types/".concat(e.name,".svg")),o.appendChild(t),(a=document.createElement("span")).textContent=primeiraLetraMaiuscula(e.name),n.appendChild(a),document.querySelectorAll(".type-filter").forEach(function(e){e.addEventListener("click",filterByTypes)}))})}),document.getElementById("js-btn-load-more")),countPagination=10;function showMorePokemon(){listingPokemons("https://pokeapi.co/api/v2/pokemon?limit=9&offset=".concat(countPagination)),countPagination+=9}function filterByTypes(){var e=this.getAttribute("code-type"),t=document.getElementById("js-list-pokemons"),n=document.getElementById("js-btn-load-more"),o=document.querySelectorAll(".type-filter");t.innerHTML="",n.style.display="none";var a=document.querySelector(".s-all-info-pokemons").offsetTop;window.scrollTo({top:a+288,behavior:"smooth"}),o.forEach(function(e){e.classList.remove("active")}),this.classList.add("active"),e?axios({method:"GET",url:"https://pokeapi.co/api/v2/type/".concat(e)}).then(function(e){e=e.data.pokemon;countPokemons.textContent=e.length,e.forEach(function(e){e=e.pokemon.url;axios({method:"GET",url:"".concat(e)}).then(function(e){var e=e.data,t=e.name,n=e.id,o=e.sprites,e=e.types,t={nome:t,code:n,imagePok:o.other.dream_world.front_default,type:e[0].type.name};t.imagePok&&createCardPokemon(t.code,t.type,t.nome,t.imagePok),document.querySelectorAll(".js-open-details-pokemon").forEach(function(e){e.addEventListener("click",openDetailsPokemon)})})})}):(t.innerHTML="",listingPokemons("https://pokeapi.co/api/v2/pokemon?limit=9&offset=0"),n.style.display="block")}btnLoadMore.addEventListener("click",showMorePokemon);var btnSearch=document.getElementById("js-btn-search"),inputSearch=document.getElementById("js-input-search");function searchPokemon(){var e=inputSearch.value.toLowerCase();document.querySelectorAll(".type-filter").forEach(function(e){e.classList.remove("active")}),axios({method:"GET",url:"https://pokeapi.co/api/v2/pokemon/".concat(e)}).then(function(e){areaPokemons.innerHTML="",btnLoadMore.style.display="none",countPokemons.textContent=1;var e=e.data,t=e.name,n=e.id,o=e.sprites,e=e.types,t={nome:t,code:n,imagePok:o.other.dream_world.front_default,type:e[0].type.name};t.imagePok&&createCardPokemon(t.code,t.type,t.nome,t.imagePok),document.querySelectorAll(".js-open-details-pokemon").forEach(function(e){e.addEventListener("click",openDetailsPokemon)})}).catch(function(e){e.response&&(areaPokemons.innerHTML="",btnLoadMore.style.display="none",countPokemons.textContent=0,alert("Não foi encontrado nenhum resultado com esta pesquisa!"))})}btnSearch.addEventListener("click",searchPokemon),inputSearch.addEventListener("keyup",function(e){"Enter"===e.code&&searchPokemon()});