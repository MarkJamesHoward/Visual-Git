import { useStore } from "@nanostores/react";
import { AutoMoveViewForwardNanoStore, ShowTreesNanoStore } from "../State";
import { ShowBlobsNanoStore } from "../State";
import { ShowTagsNanoStore } from "../State";

function HideThings() {

    const ShowTreesCurrentValue = useStore(ShowTreesNanoStore);
    const ShowBlobsCurrentValue = useStore(ShowBlobsNanoStore);
    const ShowTagsCurrentValue = useStore(ShowTagsNanoStore);
    const AutoMoveViewForwardCurrentValue = useStore(AutoMoveViewForwardNanoStore);

    return (
        <div id="ToggleView" style={{ position: "absolute", bottom: "50px", left: "500px" }}>
            <div
                className="margin:md display:flex background-color:black flex-direction:column border-color:white border-style:solid border-width:md border-radius:10px"
            >
                <div
                    className="cursor:pointer background-color:indigo height:30px"
                    style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}

                    id="ToggleViewHEADER"
                >
                </div>
                <div className="padding:md border-radius:10px">
                    <div
                        className="display:flex md?flex-direction:row flex-direction:column flex-wrap:nowrap gap:xl"

                    >
                        <button
                            id="ToggleTree"
                            onClick={() => ShowTreesNanoStore.set(!ShowTreesCurrentValue)}
                            className="background-color:blue background-color:blue:hover color:white font-weight:800 padding:md border-radius:10px"
                        >
                            {ShowTreesCurrentValue ? <span>Hide Tree</span> : <span>Show Tree</span>}
                        </button>
                        <button
                            className="background-color:blue background-color:blue:hover color:white font-weight:800 padding:md border-radius:10px"
                            onClick={() => ShowBlobsNanoStore.set(!ShowBlobsCurrentValue)}
                            id="ToggleBlob"

                        >
                            {ShowBlobsCurrentValue ? <span>Hide Blob</span> : <span>Show Blob</span>}
                        </button>
                        <button
                            onClick={() => ShowTagsNanoStore.set(!ShowTagsCurrentValue)}
                            className="background-color:blue background-color:blue:hover color:white font-weight:800 padding:md border-radius:10px"
                            id="ToggleTag"
                        >
                            {ShowTagsCurrentValue ? <span>Hide Tag</span> : <span>Show Tag</span>}
                        </button>
                    </div>

                </div>
                <div
                    className="display:flex flex-direction:column gap:10px align-items:center"
                >
                    <div
                        className="display:flex align-items:center margin-bottom:sm align-self:center"
                    >
                        <input
                            checked={AutoMoveViewForwardCurrentValue}
                            onChange={() => AutoMoveViewForwardNanoStore.set(!AutoMoveViewForwardCurrentValue)}
                            id="ToggleAutoMoveViewForward"
                            type="checkbox"
                            className="color:blue background-color:gray border-color:gray border-radius:10px"
                        />
                        <label
                            htmlFor="ToggleAutoMoveViewForward"
                            className="margin-left:sm color:white user-select:none"
                        >Auto Update</label>
                    </div>
                    <div className="display:flex flex-direction:row margin-bottom:md">
                        <button
                            disabled

                            className="disabled:opacity-25 background-color:blue font-weight:200:hover color:white font-weight:800 padding:md border-radius:10px"
                            id="MoveViewBack"
                        >
                            &lsaquo;
                        </button>
                        <input
                            disabled
                            style={{ width: '30px' }}
                            className="width:30px margin-left:sm margin-right:sm display:inline background-color:gray border border-color:gray color:white font-size:md border-radius:10px padding:md"
                            type="text"
                            id="CurrentDataSet"
                        />
                        <button
                            disabled
                            className="disabled:opacity-25 background-color:blue background-color:blue:hover color:white font-weight:800 padding:md border-radius:10px"
                            id="MoveViewForward"
                        >
                            &rsaquo;
                        </button>
                    </div>
                </div>
            </div>
        </div >
    )

}


export default HideThings;