// We may use webpack's hot module replacement in order to enhance development
// See: https://webpack.js.org/api/hot-module-replacement/
// declare const module;
// if (module.hot) {
//   module.hot.accept(`./foo`, function () {})
// }

// TODO: Recover this module back to loading components like foo/bar etc
import "./utils/modules.declaration";
import "normalize.css";
import { AxiosStatic as AxiosStaticT } from "axios";
window.addEventListener(`load`, async function (e) {



    // Wellcoming message
    const welcomeMessage = `
    Welcome to the project bolierplate.

    The following libraries are avaialable:
        - axios                         # http client
        - fetch                         # whatwg fetch polyfil
        - @emmetio/expand-abbreviation  # emmetio
    `;

    console.clear();
    console.log(welcomeMessage)



    // Removing placeholder
    const getElemById = document.getElementById.bind(document);
    const waitingMsg  = getElemById(`body-waiting-message`);
        //   waitingMsg.remove() // Doesn't work in IE
          waitingMsg.parentElement.removeChild(waitingMsg);



    // Some random data
    const data = new Array(1).fill({
        title  : `Hello world!`,
        content: `Lorem ipsum, dolor sit amet consectetur adipisicing elit.`
        + `Ea similique quidem id ipsum ipsam veritatis eveniet ducimus cumque accusantium officiis,`
        + `mollitia quia autem sequi nostrum temporibus atque dolorum! Omnis, sint.`,
        img: `/public/assets/Space_small.jpg`
    });



    // Loading assets file generated by webpack
    try {

        const response = await fetch(`/assets`);
        if (response.ok) {
            const content = await response.json()
            data.push({
                title  : `Assets data`,
                content: JSON.stringify(content)
            })
        } else {
            data.push({ title: `assets failed`})
        }

    } catch (error) {

        console.log(`assets loading failed`, error)
    }



    // Loading faked data
    let axios: AxiosStaticT;
    try {

              axios        = await import(/* webpackChunkName: "axios" */`axios`) as any;
        const loreResponse = await axios.get(`/fake/lorem/32`)
        const fakeResponse = await axios.get(`/fake/`)
        if (loreResponse.status === 200) {
            data.push({ title: `Lorem goes here!`, content: loreResponse.data })
        }
        if (fakeResponse.status === 200) {
            const content = typeof fakeResponse.data === `string`
                ? JSON.parse(fakeResponse.data)
                : fakeResponse.data
            data.push({
                ...content,
                title: `Axios request response`,
            })
        } else {
            data.push({ title: `Axios failed`})
        }

    } catch (error) {
        console.log(error)
        debugger
    //
    }



    // Loading default PostView dynamically
    let PostView;
    try {
        PostView = (await import(/* webpackChunkName: "post/view" */`./post/view`)).PostView;
    } catch (error) {
        document.body.insertAdjacentHTML(`beforeend`, `<h1>Failed to load default PostView </h1>`)
    }
    if (PostView) {
        debugger
        data.map((entry) => new PostView(entry).render()).forEach(document.body.appendChild.bind(document.body))
    }
})
