import { Feather, FontAwesome, Octicons } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, StatusBar, Text, View } from '@gluestack-ui/themed';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  View as RNView,
  ScrollView,
  Share,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnitDrawer from '../../components/UnitDrawer';
import {
  getDisplayIngredientRows,
  type DisplayIngredientRow,
  type UnitSystem,
} from '../../domain/ingredients/ingredientDisplayAdapter';
import { useRecipeStore } from '../../stores/useRecipeStore';
import theme from '../../theme';

const fallbackImage = require('../../assets/images/error.png');
type IngredientDisplayMode = 'original' | UnitSystem;
function getDisplayModeFromPreference(
  preference: 'default' | UnitSystem
): IngredientDisplayMode {
  if (preference === 'imperial' || preference === 'metric') return preference;
  return 'original';
}

function getNextServingsUp(current: number): number {
  if (!Number.isFinite(current)) return 1;
  return Math.min(99, current + 1);
}

function getNextServingsDown(current: number): number {
  if (!Number.isFinite(current)) return 1;
  return Math.max(1, current - 1);
}

function formatServings(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '-';
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return String(Math.round(value));
  }
  return value.toFixed(2).replace(/\.?0+$/, '');
}

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const toggleFavourite = useRecipeStore((state) => state.toggleFavourite);
  const ingredientUnitPreference = useRecipeStore(
    (state) => state.ingredientUnitPreference
  );
  const recipe = useRecipeStore((state) => state.getRecipeById(id || ''));

  const scrollViewRef = useRef<ScrollView>(null);

  const [tickedIngredients, setTickedIngredients] = useState<boolean[]>([]);
  const [tickedInstructions, setTickedInstructions] = useState<boolean[]>([]);
  const [displayMode, setDisplayMode] = useState<IngredientDisplayMode>(
    getDisplayModeFromPreference(ingredientUnitPreference)
  );
  const [isUnitDrawerOpen, setIsUnitDrawerOpen] = useState(false);
  const [scaledServingsTarget, setScaledServingsTarget] = useState<number>(1);

  const servingsBase = React.useMemo(() => {
    const parsed = Number(recipe?.servingSize);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [recipe?.servingSize]);

  const scaleFactor = React.useMemo(() => {
    if (!Number.isFinite(scaledServingsTarget) || scaledServingsTarget <= 0 || servingsBase <= 0) {
      return 1;
    }
    return scaledServingsTarget / servingsBase;
  }, [scaledServingsTarget, servingsBase]);

  const ingredientRows = React.useMemo(
    () =>
      getDisplayIngredientRows(
        recipe,
        displayMode === 'original' ? undefined : displayMode,
        scaleFactor
      ),
    [recipe, displayMode, scaleFactor]
  );
  const ingredients = React.useMemo(
    () => ingredientRows.map((row) => row.rawText),
    [ingredientRows]
  );
  const instructions = React.useMemo(
    () => (recipe && Array.isArray(recipe.instructions) ? recipe.instructions : []),
    [recipe]
  );
  
  const notes = React.useMemo(
    () => (recipe && Array.isArray(recipe.notes) ? recipe.notes.map(String) : []),
    [recipe]
  );
  const imageSource =
    recipe?.imageUrl?.length && (recipe.imageUrl.startsWith('http') || recipe.imageUrl.startsWith('file'))
      ? { uri: recipe.imageUrl }
      : fallbackImage;


  React.useEffect(() => {
    setTickedIngredients(ingredients.map(() => false));
    setTickedInstructions(instructions.map(() => false));
  }, [ingredients, instructions]);

  React.useEffect(() => {
    setDisplayMode(getDisplayModeFromPreference(ingredientUnitPreference));
    setScaledServingsTarget(servingsBase);
  }, [id, ingredientUnitPreference, servingsBase]);

  useFocusEffect(
    React.useCallback(() => {
      setDisplayMode(getDisplayModeFromPreference(ingredientUnitPreference));
      return undefined;
    }, [ingredientUnitPreference])
  );



  if (!id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body400}>Invalid Recipe ID</Text>
        <Pressable onPress={() => router.replace('/recipes/')}>
          <Text style={[styles.body400, { color: 'blue', marginTop: 10 }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body400}>Recipe not found</Text>
        <Pressable onPress={() => router.replace('/recipes/')}>
          <Text style={[styles.body400, { color: 'blue', marginTop: 10 }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const toggleIngredient = (index: number) => {
    setTickedIngredients(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const toggleInstruction = (index: number) => {
    setTickedInstructions(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };


  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (recipe.imageUrl && recipe.imageUrl.startsWith(FileSystem.documentDirectory!)) {
              try {
                await FileSystem.deleteAsync(recipe.imageUrl, { idempotent: true });
              } catch (err) {
                console.warn('Failed to delete image:', err);
              }
            }
            deleteRecipe(recipe.id);
            router.replace('/recipes/');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: \n\n${recipe.title}\nBy ${recipe.source}\n\nIngredients:\n${ingredients.join(
          '\n'
        )}\n\nInstructions:\n${instructions.join('\n\n')}\n\nRecipe shared by Recipe Nuts\n\nAvailable on the Play Store`,
      });
    } catch (error) {
      console.error('Error sharing:', error instanceof Error ? error.message : error);
    }
  };

  const renderIngredientText = (row: DisplayIngredientRow) => {
    if (row.mode === 'structured') {
      return (
        <Text style={styles.ingredientText}>
          {(row.quantityText || row.unitText) && (
            <Text style={styles.ingredientTextStrong}>
              {[row.quantityText, row.unitText].filter(Boolean).join(' ')}{' '}
            </Text>
          )}
          {row.ingredientText || row.rawText}
          {row.noteText ? ` (${row.noteText})` : ''}
        </Text>
      );
    }

    return <Text style={styles.ingredientText}>{row.rawText}</Text>;
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar backgroundColor={theme.colors.bg} barStyle="dark-content" />

      {/* Header */}
      <HStack pl={6} pr={18} py={14} justifyContent="space-between" alignItems="center">
        <Pressable hitSlop={5} onPress={() => router.replace('/recipes/')}>
          <Feather name="chevron-left" size={32} color="#333" />
        </Pressable>
        <Box flexDirection="row">
          <Pressable pr={35} hitSlop={5} onPress={handleShare}>
            <Feather name="share-2" size={23} color="#333" />
          </Pressable>
          <Pressable pr={35} hitSlop={5} onPress={() => router.push(`/recipes/EditRecipe?id=${recipe.id}`)}>
            <Feather name="edit-2" size={23} color="#333" />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={5}>
            <Feather name="trash-2" size={24} color="#C1121F" />
          </Pressable>
        </Box>
      </HStack>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.heading3xl}>{recipe.title}</Text>
          <Text style={styles.headingMd}>{recipe.source}</Text>

          {/* Recipe Image & Favorite */}
        <Box>
          <Image source={imageSource} style={styles.image} resizeMode="cover" borderRadius={12} alt='recipe image'/>
          <Pressable
            onPress={() => toggleFavourite(recipe.id)}
            hitSlop={5}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
          >
            <Box bg="white" p={4} borderRadius={6} alignItems="center" justifyContent="center">
              <FontAwesome
                name={recipe.favourite ? 'star' : 'star-o'}
                size={22}
                color={recipe.favourite ? '#FFC107' : '#999'}
              />
            </Box>
          </Pressable>
        </Box>
          
          {/* Recipe Stats 2 */}
          <HStack paddingTop={20}>
              <Feather name="clock" size={18} color="#111" />
              <Text style={styles.metaText}>
                {+recipe.prepTime + +recipe.cookTime || '-'} mins
              </Text>

              <Feather name="user" size={18} color="#111" />
              <Text style={styles.metaText}>
                Serves {formatServings(servingsBase)}
              </Text>

              <Feather name="bar-chart" size={18} color="#111" />
              <Text style={styles.metaText}>
                {recipe.difficulty || 'Medium'}
              </Text>
          </HStack>

          {/* Ingredients */}
          <HStack style={styles.sectionHeaderRow}>
            <Text style={[styles.heading2xl, { marginTop: 0, marginBottom: 0 }]}>
              Ingredients
            </Text>
          </HStack>
          <HStack style={styles.controlsRow}>
            <HStack style={styles.inlineControls}>
              <Pressable
                style={styles.scaleInlineButton}
                onPress={() => setScaledServingsTarget((value) => getNextServingsDown(value))}
              >
                <Feather name="minus" size={14} color={theme.colors.text1} />
              </Pressable>
              <View style={styles.scaleInlineValueBox}>
                <Text style={styles.scaleInlineValue}>
                  {formatServings(scaledServingsTarget)} Servings
                </Text>
              </View>
              <Pressable
                style={styles.scaleInlineButton}
                onPress={() => setScaledServingsTarget((value) => getNextServingsUp(value))}
              >
                <Feather name="plus" size={14} color={theme.colors.text1} />
              </Pressable>
            </HStack>
            <Pressable style={styles.unitToggle} onPress={() => setIsUnitDrawerOpen(true)}>
              <HStack style={styles.unitToggleInner}>
                <Feather name="sliders" size={14} color={theme.colors.text1} />
                <Text style={styles.unitToggleText}>Units</Text>
              </HStack>
            </Pressable>
          </HStack>
          <Box style={styles.ingredientBox}>
            {ingredientRows.length > 0 ? (
              ingredientRows.map((row, index) => (
                
                <View key={`ing-${index}`}>
                  <Pressable onPress={() => toggleIngredient(index)}>                  
                    <HStack style={styles.ingredientHStack}>
                      <Box style={tickedIngredients[index]
                        ? styles.ingredientTicked
                        : styles.ingredientNotTicked
                        
                      }>
                        {tickedIngredients[index] && (
                          <Octicons name="check" size={20} color={theme.colors.ctaText} />
                        )}
                      </Box>
                      <View style={tickedIngredients[index] ? { opacity: 0.3 } : undefined}>
                        {renderIngredientText(row)}
                      </View>
                    </HStack>
                  </Pressable> 
                </View>
              ))
            ) : (
              <Text style={styles.itemText}>No ingredients available</Text>
            )}
          </Box>

          {/* Instructions */}
          <Text style={styles.heading2xl}>Instructions</Text>
          <RNView>
            {instructions.length > 0 ? (
              instructions.map((step, index) => (
                <Pressable key={`step-${index}`} onPress={() => toggleInstruction(index)}>
                  <View style={{ marginBottom: index === instructions.length - 1 ? 0 : 15 }}>
                    <HStack style={styles.instructionHStack}>
                      <View
                        style={[
                          styles.stepHeading,
                          tickedInstructions[index] && { backgroundColor: theme.colors.cta, borderWidth:0, opacity: tickedInstructions[index] ? 0.75 : 1 }, // optional
                        ]}
                      >
                        {tickedInstructions[index] ? (
                          <Octicons name="check" size={20} color={theme.colors.ctaText} />
                        ) : (
                          <Text style={{ color: 'white', fontFamily: 'body-700' }}>{index + 1}</Text>
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.instructionParagraph,
                          {opacity: tickedInstructions[index] ? 0.3 : 1}]}
                      >
                        {step}
                      </Text>
                    </HStack>
                  </View>
                </Pressable>
              ))
            ) : (
              <Box style={styles.ingredientBox}>
                <Text style={styles.itemText}>No instructions available</Text>
              </Box>
            )}
          </RNView>

          {/* Notes */}
          {notes.length > 0 && (
            <>
              <Text style={styles.heading2xl}>Notes</Text>
              <Box style={styles.note}>
                {notes.map((note, index) => (
                  <Text key={`note-${index}`} style={styles.noteText}>
                  {note}
                  </Text>
                ))}
              </Box>
            </>
          )}
        </View>
      </ScrollView>
      <UnitDrawer
        isOpen={isUnitDrawerOpen}
        onClose={() => setIsUnitDrawerOpen(false)}
        selectedUnit={displayMode}
        onUnitSelect={(unit) => setDisplayMode(unit)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 16 }
    ,
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  image: { 
    width: '100%', 
    height: 300 
  },
  ingredientBox: {
    backgroundColor: theme.colors.paper, 
    paddingHorizontal:16, 
    paddingVertical:24, 
    borderRadius:12, 
    gap: 20
  },
  ingredientHStack: {
    //alignItems:'flex-start',
    alignItems:'center',
    borderRadius: 12,
    gap: 10,
  },
  ingredientNotTicked: {
    lineHeight:28,
    width:30,
    height:30,
    borderRadius:15,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#888',
    borderStyle:'dashed',
    borderWidth:1,
    //backgroundColor: theme.colors.cta,
    //borderWidth:0,
  },
  ingredientTicked: {
    lineHeight:28,
    width:30,
    height:30,
    borderRadius:15,
    justifyContent: 'center',
    alignItems: 'center',
    //borderColor: '#888',
    //borderStyle:'dashed',
    //borderWidth:1,
    backgroundColor: theme.colors.cta,
    borderWidth:0,
    opacity:0.75,
  },
  ingredientText: { 
    paddingLeft: 16,
    paddingRight: 42,
    fontSize: 16, 
    lineHeight: 28, 
    fontFamily: 'body-500', 
    color: theme.colors.text1 
  },
  ingredientTextStrong: {
    fontFamily: 'body-700',
    color: theme.colors.text1,
  },
  instructionHStack: {
    alignItems:'center',
    paddingHorizontal:16, 
    paddingVertical:24, 
    borderRadius: 12,
    gap: 10,
    backgroundColor: theme.colors.paper, 
  },
  stepHeading: { 
    fontFamily: 'body-700', 
    fontSize: 16, 
    lineHeight:28,
    width:30,
    height:30,
    borderRadius:15,
    backgroundColor: theme.colors.cta,
    justifyContent:'center',
    alignItems: 'center',
    //borderColor: '#888',
    //borderStyle:'dashed',
    //borderWidth:1,
  },
  instructionParagraph: {
    paddingLeft:16,
    paddingRight: 42,
    fontSize: 16,
    lineHeight: 28, 
    fontFamily: 'body-500', 
    color: theme.colors.text1 
  },
  note: {
    alignItems:'flex-start',
    paddingHorizontal:16, 
    paddingVertical:16, 
    borderRadius: 12,
    backgroundColor: theme.colors.paper, 
  },
  noteText: {
    paddingVertical:6,
    fontSize: 16,
    lineHeight: 28, 
    fontFamily: 'body-500', 
    color: theme.colors.text1 
  },
  itemText: {
    paddingHorizontal:16,
    paddingVertical:16,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 28, 
    fontFamily: 'body-600', 
    color: theme.colors.text1 
  },
  heading2xl: { 
    fontSize: 24, 
    fontFamily: 'heading-900', 
    marginBottom: 20, 
    marginTop: 30, 
    color: theme.colors.text1 
  },
  sectionHeaderRow: {
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  controlsRow: {
    marginBottom: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlineControls: {
    alignItems: 'center',
    gap: 12,
  },
  unitToggle: {
    height: 35,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitToggleInner: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  unitToggleText: {
    fontFamily: 'body-600',
    color: theme.colors.text1,
    fontSize: 16,
    includeFontPadding: false,
  },
  scaleInlineButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scaleInlineValueBox: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleInlineValue: {
    minWidth: 20,
    textAlign: 'center',
    fontFamily: 'body-600',
    color: theme.colors.text1,
    fontSize: 16,
    includeFontPadding: false,
  },
  heading3xl: { 
    fontSize: 30, 
    fontFamily: 'heading-900', 
    paddingTop: 14, 
    color: theme.colors.text1 
  },
  headingMd: { 
    fontSize: 18, 
    fontFamily: 'body-600', 
    marginTop: 5, 
    marginBottom: 15, 
    color: theme.colors.text2 
  },
  metaText: { 
    fontSize: 16, 
    fontFamily: 'body-600', 
    color: theme.colors.text1, 
    textAlign: 'center', 
    paddingLeft: 6,
    paddingRight: 22 
  },
  body400: { 
    fontFamily: 'body-400' 
  },
});
