import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";
import { Navigate, useLocation, useMatch, useNavigate } from "react-router";
import { useNestedHistoryContext } from "react-native-url-router";
const BookReservationModal = () => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const isModalOpen = useMatch("/modal/book");
    const { resetPrefix } = useNestedHistoryContext();
    // variables
    const snapPoints = useMemo(() => ["80%"], []);

    useEffect(() => {
        if(isModalOpen){
      bottomSheetModalRef.current?.present();

        }else{
      bottomSheetModalRef.current?.close();
        }
    }, [isModalOpen]);

    // callbacks
   
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={() => resetPrefix("/modal")}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <View style={styles.contentContainer}>
          <Text style={{ fontSize: 30 }}>
            L
            <Text style={{ fontSize: 18 }}>
              orem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              {"'\n\n"}
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
              {"'\n\n"}
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Text>
          </Text>
        </View>
      </BottomSheetModal>
    );
}
const styles = {
    contentContainer: {
      padding: 20,
    }
}
export default BookReservationModal;
